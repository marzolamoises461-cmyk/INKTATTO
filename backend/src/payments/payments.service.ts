import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../user/entities/user.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';

interface WompiTransaction {
  id: string;
  reference: string;
  status: string;
  amount_in_cents: number;
  currency: string;
}

interface WompiWebhook {
  event?: string;
  environment?: string;
  data?: { transaction?: WompiTransaction };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
}

interface WompiConfig {
  environment: 'sandbox' | 'production';
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  eventsSecret: string;
}

export interface CheckoutDetails {
  status: PaymentStatus;
  reference: string;
  amountInCents: number;
  checkoutUrl: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async createCheckout(bookingId: number, user: User): Promise<CheckoutDetails> {
    const wompi = this.getConfig();
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: { user: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!booking) throw new NotFoundException('La cita no existe.');
      if (booking.user.id !== user.id) throw new ForbiddenException('No puedes pagar el anticipo de otra cita.');
      if (booking.status !== 'quoted' || !booking.depositAmount) {
        throw new BadRequestException('La cita no tiene un anticipo cotizado disponible para pago.');
      }

      const deposit = Number(booking.depositAmount);
      if (!Number.isSafeInteger(deposit) || deposit <= 0) {
        throw new BadRequestException('El anticipo debe ser un valor entero positivo en pesos colombianos.');
      }
      const amountInCents = deposit * 100;
      if (amountInCents > 4_294_967_295) {
        throw new BadRequestException('El anticipo supera el máximo permitido por la pasarela.');
      }

      const paymentRepository = manager.getRepository(Payment);
      let payment = await paymentRepository.findOne({
        where: { bookingId, status: 'pending' },
        order: { createdAt: 'DESC' },
      });
      if (!payment) {
        payment = await paymentRepository.save(paymentRepository.create({
          bookingId,
          reference: `inktatto-${bookingId}-${randomBytes(16).toString('hex')}`,
          providerTransactionId: null,
          amountInCents,
          status: 'pending',
        }));
      } else if (payment.amountInCents !== amountInCents) {
        throw new BadRequestException('El valor del anticipo cambió; solicita una nueva cotización.');
      } else if (payment.providerTransactionId) {
        throw new BadRequestException('Wompi ya está procesando este anticipo; consulta su estado antes de reintentar.');
      }

      const signature = createHash('sha256')
        .update(`${payment.reference}${payment.amountInCents}COP${wompi.integritySecret}`)
        .digest('hex');
      const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL').replace(/\/+$/, '');
      const checkout = new URL('https://checkout.wompi.co/p/');
      checkout.searchParams.set('public-key', wompi.publicKey);
      checkout.searchParams.set('currency', 'COP');
      checkout.searchParams.set('amount-in-cents', String(payment.amountInCents));
      checkout.searchParams.set('reference', payment.reference);
      checkout.searchParams.set('signature:integrity', signature);
      checkout.searchParams.set('redirect-url', `${frontendUrl}/payment-return?bookingId=${bookingId}`);
      checkout.searchParams.set('customer-data:email', booking.user.email);
      checkout.searchParams.set('customer-data:full-name', booking.user.fullName);
      return {
        status: payment.status,
        reference: payment.reference,
        amountInCents: payment.amountInCents,
        checkoutUrl: checkout.toString(),
      };
    });
  }

  async statusForBooking(bookingId: number, user: User): Promise<{ status: PaymentStatus | 'not_started' }> {
    const booking = await this.bookings.findOne({ where: { id: bookingId }, relations: { user: true } });
    if (!booking) throw new NotFoundException('La cita no existe.');
    if (booking.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para consultar este pago.');
    }
    const payment = await this.payments.findOne({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
    return { status: payment?.status ?? 'not_started' };
  }

  async processWebhook(event: WompiWebhook): Promise<void> {
    const wompi = this.getConfig();
    const transaction = event.data?.transaction;
    const properties = event.signature?.properties;
    const checksum = event.signature?.checksum;
    if (
      event.event !== 'transaction.updated' ||
      event.environment !== (wompi.environment === 'production' ? 'prod' : 'test') ||
      !transaction?.id ||
      typeof transaction.reference !== 'string' ||
      !transaction.reference.trim() ||
      !Number.isSafeInteger(transaction.amount_in_cents) ||
      transaction.currency !== 'COP' ||
      !Array.isArray(properties) ||
      properties.length === 0 ||
      properties.length > 20 ||
      !Number.isSafeInteger(event.timestamp) ||
      !checksum
    ) {
      throw new UnauthorizedException('El evento de pago no es válido.');
    }

    const values = properties.map((property) => this.readWebhookProperty(event.data, property));
    const expected = createHash('sha256')
      .update(`${values.join('')}${event.timestamp}${wompi.eventsSecret}`)
      .digest();
    const supplied = Buffer.from(checksum, 'hex');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      throw new UnauthorizedException('La firma del evento de pago no es válida.');
    }

    const pending = await this.payments.findOne({ where: { reference: transaction.reference } });
    if (!pending) return;
    if (pending.amountInCents !== transaction.amount_in_cents) {
      throw new UnauthorizedException('El valor del evento no coincide con la referencia registrada.');
    }

    const confirmed = await this.fetchTransaction(transaction.id, wompi);
    if (
      confirmed.id !== transaction.id ||
      confirmed.reference !== pending.reference ||
      confirmed.amount_in_cents !== pending.amountInCents ||
      confirmed.currency !== 'COP'
    ) {
      throw new UnauthorizedException('La transacción consultada no coincide con el pago pendiente.');
    }

    const status = this.mapStatus(confirmed.status);
    await this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(Payment, {
        where: { id: pending.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!current) throw new NotFoundException('El pago ya no existe.');
      if (current.status === 'approved' && status !== 'approved') return;
      current.providerTransactionId = confirmed.id;
      current.status = status;
      await manager.save(Payment, current);
    });
  }

  private getConfig(): WompiConfig {
    const keys = [
      'WOMPI_PUBLIC_KEY',
      'WOMPI_PRIVATE_KEY',
      'WOMPI_INTEGRITY_SECRET',
      'WOMPI_EVENTS_SECRET',
    ] as const;
    const configured = keys.map((key) => this.config.get<string>(key)?.trim());
    if (configured.some((value) => !value)) {
      throw new ServiceUnavailableException('La integración de pagos Wompi no está configurada por completo.');
    }
    const environment = this.config.get<string>('WOMPI_ENVIRONMENT', 'sandbox');
    if (environment !== 'sandbox' && environment !== 'production') {
      throw new ServiceUnavailableException('WOMPI_ENVIRONMENT debe ser sandbox o production.');
    }
    const [publicKey, privateKey, integritySecret, eventsSecret] = configured as [string, string, string, string];
    const prefix = environment === 'production' ? 'prod' : 'test';
    if (!publicKey.startsWith(`pub_${prefix}_`) || !privateKey.startsWith(`prv_${prefix}_`)) {
      throw new ServiceUnavailableException('Las llaves Wompi no corresponden al ambiente configurado.');
    }
    return { environment, publicKey, privateKey, integritySecret, eventsSecret };
  }

  private readWebhookProperty(data: WompiWebhook['data'], property: string): string {
    if (!/^[a-zA-Z0-9_.]+$/.test(property) || property.split('.').some((part) => ['__proto__', 'constructor', 'prototype'].includes(part))) {
      throw new UnauthorizedException('La firma contiene propiedades inválidas.');
    }
    const value = property.split('.').reduce<unknown>((current, part) => {
      if (typeof current !== 'object' || current === null) return undefined;
      return (current as Record<string, unknown>)[part];
    }, data);
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new UnauthorizedException('La firma contiene propiedades no disponibles.');
    }
    return String(value);
  }

  private async fetchTransaction(id: string, wompi: WompiConfig): Promise<WompiTransaction> {
    const baseUrl = wompi.environment === 'production'
      ? 'https://production.wompi.co'
      : 'https://sandbox.wompi.co';
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/v1/transactions/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${wompi.privateKey}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException('No se pudo verificar el pago con Wompi.');
    }
    if (!response.ok) throw new ServiceUnavailableException('Wompi no confirmó la transacción.');
    const payload = await response.json() as { data?: WompiTransaction };
    if (!payload.data) throw new ServiceUnavailableException('Wompi devolvió una respuesta de transacción inválida.');
    return payload.data;
  }

  private mapStatus(status: string): PaymentStatus {
    const statuses: Record<string, PaymentStatus> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      DECLINED: 'declined',
      VOIDED: 'voided',
      ERROR: 'error',
    };
    const mapped = statuses[status];
    if (!mapped) throw new BadRequestException('Wompi devolvió un estado de transacción desconocido.');
    return mapped;
  }
}
