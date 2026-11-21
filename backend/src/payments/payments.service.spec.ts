import { BadRequestException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

const wompiConfig = {
  WOMPI_ENVIRONMENT: 'sandbox',
  WOMPI_PUBLIC_KEY: 'pub_test_public',
  WOMPI_PRIVATE_KEY: 'prv_test_private',
  WOMPI_INTEGRITY_SECRET: 'integrity-secret',
  WOMPI_EVENTS_SECRET: 'events-secret',
  FRONTEND_URL: 'https://inktattoo.example',
};

describe('PaymentsService', () => {
  const customer = { id: 8, role: 'user' } as never;
  const booking = {
    id: 31,
    status: 'quoted',
    depositAmount: '25000.00',
    user: { id: 8, email: 'cliente@example.com', fullName: 'Cliente' },
  } as Booking;
  let service: PaymentsService;
  let payments: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let bookings: { findOne: jest.Mock };
  let manager: { findOne: jest.Mock; getRepository: jest.Mock; save: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let config: { get: jest.Mock; getOrThrow: jest.Mock };
  let paymentRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    paymentRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: Partial<Payment>) => value),
      save: jest.fn(async (value: Partial<Payment>) => ({ id: 5, createdAt: new Date(), ...value }) as Payment),
    };
    payments = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: Partial<Payment>) => value),
      save: jest.fn(async (value: Partial<Payment>) => ({ id: 5, createdAt: new Date(), ...value }) as Payment),
    };
    bookings = { findOne: jest.fn().mockResolvedValue(booking) };
    manager = {
      findOne: jest.fn((entity: unknown) => Promise.resolve(entity === Booking
        ? booking
        : { id: 5, status: 'pending', reference: 'ref', amountInCents: 2_500_000 })),
      getRepository: jest.fn(() => paymentRepository),
      save: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(async (callback: (value: typeof manager) => unknown) => callback(manager)),
    };
    config = {
      get: jest.fn((key: string, fallback?: string) => wompiConfig[key as keyof typeof wompiConfig] ?? fallback),
      getOrThrow: jest.fn((key: string) => wompiConfig[key as keyof typeof wompiConfig]),
    };
    service = new PaymentsService(
      payments as unknown as Repository<Payment>,
      bookings as unknown as Repository<Booking>,
      dataSource as never,
      config as unknown as ConfigService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('creates a checkout from the persisted quote and keeps the local payment pending', async () => {
    const checkout = await service.createCheckout(31, customer);

    expect(paymentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      bookingId: 31,
      amountInCents: 2_500_000,
      status: 'pending',
      reference: expect.stringMatching(/^inktatto-31-[a-f0-9]{32}$/),
    }));
    const checkoutUrl = new URL(checkout.checkoutUrl);
    expect(checkout.status).toBe('pending');
    expect(checkoutUrl.origin).toBe('https://checkout.wompi.co');
    expect(checkoutUrl.searchParams.get('amount-in-cents')).toBe('2500000');
    expect(checkoutUrl.searchParams.get('signature:integrity')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('does not prepare a checkout if provider credentials are absent', async () => {
    config.get.mockReturnValue(undefined);
    await expect(service.createCheckout(31, customer)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(bookings.findOne).not.toHaveBeenCalled();
  });

  it('rejects a webhook with a forged signature without confirming any payment', async () => {
    const event = signedEvent();
    event.signature.checksum = 'WRONG';
    await expect(service.processWebhook(event)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('marks a payment approved only after matching the transaction fetched from Wompi', async () => {
    payments.findOne.mockResolvedValue({
      id: 5,
      reference: 'inktatto-31-reference',
      amountInCents: 2_500_000,
      status: 'pending',
    });
    const event = signedEvent();
    event.data!.transaction!.reference = 'inktatto-31-reference';
    event.signature!.checksum = webhookChecksum(event);
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: {
        id: 'wompi-transaction-123',
        reference: 'inktatto-31-reference',
        status: 'APPROVED',
        amount_in_cents: 2_500_000,
        currency: 'COP',
      },
    }), { status: 200 }));

    await service.processWebhook(event);

    expect(manager.save).toHaveBeenCalledWith(Payment, expect.objectContaining({
      providerTransactionId: 'wompi-transaction-123',
      status: 'approved',
    }));
    fetch.mockRestore();
  });

  it('does not approve when Wompi transaction verification disagrees with the event reference', async () => {
    payments.findOne.mockResolvedValue({
      id: 5,
      reference: 'inktatto-31-reference',
      amountInCents: 2_500_000,
      status: 'pending',
    });
    const event = signedEvent();
    event.data!.transaction!.reference = 'inktatto-31-reference';
    event.signature!.checksum = webhookChecksum(event);
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: {
        id: 'wompi-transaction-123',
        reference: 'different-reference',
        status: 'APPROVED',
        amount_in_cents: 2_500_000,
        currency: 'COP',
      },
    }), { status: 200 }));

    await expect(service.processWebhook(event)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(manager.save).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it('rejects fractional pesos that cannot be represented in the checkout amount', async () => {
    manager.findOne.mockResolvedValue({ ...booking, depositAmount: '25000.50' });
    await expect(service.createCheckout(31, customer)).rejects.toBeInstanceOf(BadRequestException);
  });
});

function signedEvent(checksum = '') {
  const event = {
    event: 'transaction.updated',
    environment: 'test',
    data: {
      transaction: {
        id: 'wompi-transaction-123',
        reference: 'inktatto-31-reference',
        status: 'APPROVED',
        amount_in_cents: 2_500_000,
        currency: 'COP',
      },
    },
    signature: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      checksum,
    },
    timestamp: 1_800_000_000,
  };
  event.signature.checksum = webhookChecksum(event);
  return event;
}

function webhookChecksum(event: ReturnType<typeof signedEvent>): string {
  const transaction = event.data.transaction;
  return createHash('sha256')
    .update(`${transaction.id}${transaction.status}${transaction.amount_in_cents}${event.timestamp}${wompiConfig.WOMPI_EVENTS_SECRET}`)
    .digest('hex');
}
