import {
  Injectable, Logger, OnModuleDestroy, OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager, IsNull, LessThan, Repository,
} from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { EmailService } from './email.service';
import { NotificationOutbox } from './entities/notification-outbox.entity';

interface EmailMessage {
  eventType: string;
  entityId?: number;
  recipientEmail: string;
  subject: string;
  textBody: string;
  dedupeKey?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private missingMailConfigReported = false;
  private dispatchTimer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(NotificationOutbox)
    private readonly outbox: Repository<NotificationOutbox>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  onModuleInit(): void {
    this.dispatchTimer = setInterval(() => {
      void this.dispatchScheduled().catch((error: unknown) => {
        this.logger.error(
          `Notification dispatch failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      });
    }, 60_000);
    this.dispatchTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.dispatchTimer) clearInterval(this.dispatchTimer);
  }

  async queueBookingEvent(
    manager: EntityManager,
    booking: Booking,
    eventType: string,
    note?: string,
  ): Promise<void> {
    const details = [
      `Cita #${booking.id}`,
      `Artista: ${booking.artist}`,
      `Fecha: ${booking.date}`,
      `Hora: ${booking.time}`,
      `Duración: ${booking.durationMinutes} minutos`,
      `Estado: ${booking.status}`,
    ];
    if (booking.quotedPrice !== null && booking.quotedPrice !== undefined) {
      details.push(`Cotización: ${booking.quotedPrice} COP`);
      details.push(`Anticipo: ${booking.depositAmount ?? '0.00'} COP`);
    }
    if (note) details.push(`Mensaje del estudio: ${note}`);
    const subjectByEvent: Record<string, string> = {
      'booking.created': 'Recibimos tu solicitud de cita',
      'booking.quoted': 'El estudio preparó una cotización',
      'booking.confirmed': 'Tu cita fue confirmada',
      'booking.completed': 'Tu cita fue marcada como realizada',
      'booking.cancelled': 'Tu cita fue cancelada',
      'booking.rejected': 'Actualización sobre tu solicitud de cita',
    };
    const subject = subjectByEvent[eventType] ?? 'Actualización de tu cita INKTATTO';
    const textBody = [
      `Hola ${booking.user.fullName},`,
      '',
      ...details,
      '',
      'Si tienes preguntas, responde a este correo o contacta al estudio.',
    ].join('\n');
    await this.queueEmail(manager, {
      eventType,
      entityId: booking.id,
      recipientEmail: booking.user.email,
      subject,
      textBody,
      dedupeKey: `${booking.id}:${eventType}:client`,
    });

    const studioEmail = this.config.get<string>('STUDIO_EMAIL')?.trim();
    if (!studioEmail) {
      this.logger.warn(`STUDIO_EMAIL no está configurado; no se encoló el aviso del estudio para ${eventType}.`);
      return;
    }
    await this.queueEmail(manager, {
      eventType,
      entityId: booking.id,
      recipientEmail: studioEmail,
      subject: `[INKTATTO] ${subject}`,
      textBody: [
        `Evento: ${eventType}`,
        `Cliente: ${booking.user.fullName} <${booking.user.email}>`,
        ...details,
        ...(note ? [`Nota: ${note}`] : []),
      ].join('\n'),
      dedupeKey: `${booking.id}:${eventType}:studio`,
    });
  }

  async queueEmail(manager: EntityManager, email: EmailMessage): Promise<void> {
    await manager.save(NotificationOutbox, {
      eventType: email.eventType,
      entityId: email.entityId ?? null,
      recipientEmail: email.recipientEmail,
      subject: email.subject,
      textBody: email.textBody,
      dedupeKey: email.dedupeKey ?? null,
      status: 'pending',
      attemptCount: 0,
      availableAt: new Date(),
      lastError: null,
      sentAt: null,
    });
  }

  async queueDueReminders(now = new Date()): Promise<number> {
    const today = this.todayInBogota(now);
    const tomorrow = this.addCalendarDays(today, 1);
    const eventType = 'booking.reminder-24h';
    const bookings = await this.bookings.createQueryBuilder('booking')
      .innerJoinAndSelect('booking.user', 'user')
      .where('booking.status = :status', { status: 'confirmed' })
      .andWhere('booking.reminderSentAt IS NULL')
      .andWhere('booking.date >= :today AND booking.date <= :tomorrow', { today, tomorrow })
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM notification_outbox reminder WHERE reminder.entity_id = booking.id AND reminder.event_type = :eventType)',
        { eventType },
      )
      .orderBy('booking.date', 'ASC')
      .addOrderBy('booking.time', 'ASC')
      .take(200)
      .getMany();
    let queued = 0;
    for (const booking of bookings) {
      const appointment = this.bogotaDateTimeToUtc(booking.date, booking.time);
      const reminder = new Date(appointment.getTime() - 24 * 60 * 60 * 1000);
      if (reminder > now || appointment <= now) continue;
      const textBody = [
        `Hola ${booking.user.fullName},`,
        '',
        `Te recordamos que tienes una cita en INKTATTO mañana, ${booking.date} a las ${booking.time.slice(0, 5)}.`,
        `Artista: ${booking.artist}.`,
        'Si necesitas cambiarla, contacta al estudio cuanto antes.',
      ].join('\n');
      try {
        await this.outbox.insert({
          eventType,
          entityId: booking.id,
          recipientEmail: booking.user.email,
          subject: 'Recordatorio de tu cita de mañana',
          textBody,
          dedupeKey: `${booking.id}:booking.reminder-24h:client`,
          status: 'pending',
          attemptCount: 0,
          availableAt: now,
          lastError: null,
          sentAt: null,
        });
        queued += 1;
      } catch (error) {
        if (this.mysqlErrorCode(error) !== 'ER_DUP_ENTRY') throw error;
      }
    }
    return queued;
  }

  async status(): Promise<{ mailConfigured: boolean; pending: number; failed: number }> {
    const pending = await this.outbox.count({ where: { status: 'pending' } });
    const failed = await this.outbox.count({ where: { status: 'failed' } });
    return { mailConfigured: this.email.isConfigured(), pending, failed };
  }

  async dispatchScheduled(): Promise<void> {
    await this.queueDueReminders();
    if (!this.email.isConfigured()) {
      if (!this.missingMailConfigReported) {
        this.logger.warn('SMTP no está configurado; las notificaciones permanecen pendientes y no se marcan como enviadas.');
        this.missingMailConfigReported = true;
      }
      return;
    }
    this.missingMailConfigReported = false;

    const staleSending = new Date(Date.now() - 10 * 60 * 1000);
    await this.outbox.update(
      { status: 'sending', updatedAt: LessThan(staleSending) },
      { status: 'pending' },
    );
    const messages = await this.outbox.find({
      where: { status: 'pending', availableAt: LessThan(new Date()) },
      order: { createdAt: 'ASC' },
      take: 25,
    });
    for (const message of messages) {
      const claim = await this.outbox.update(
        { id: message.id, status: 'pending' },
        { status: 'sending', attemptCount: message.attemptCount + 1 },
      );
      if (!claim.affected) continue;
      try {
        await this.email.send({
          recipientEmail: message.recipientEmail,
          subject: message.subject,
          textBody: message.textBody,
        });
        await this.outbox.update(message.id, { status: 'sent', sentAt: new Date(), lastError: null });
        if (message.eventType === 'booking.reminder-24h' && message.entityId) {
          await this.bookings.update(
            { id: message.entityId, reminderSentAt: IsNull() },
            { reminderSentAt: new Date() },
          );
        }
      } catch (error) {
        const attempts = message.attemptCount + 1;
        const retryDelay = Math.min(60, 2 ** Math.min(attempts, 6));
        const reason = error instanceof Error ? error.message.slice(0, 1000) : 'Error SMTP desconocido';
        await this.outbox.update(message.id, {
          status: attempts >= 8 ? 'failed' : 'pending',
          availableAt: new Date(Date.now() + retryDelay * 60_000),
          lastError: reason,
        });
        this.logger.error(`No se pudo enviar la notificación ${message.id}; intento ${attempts}.`);
      }
    }
  }

  private todayInBogota(now: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  private addCalendarDays(date: string, days: number): string {
    const result = new Date(`${date}T12:00:00Z`);
    result.setUTCDate(result.getUTCDate() + days);
    return result.toISOString().slice(0, 10);
  }

  private bogotaDateTimeToUtc(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute, second = 0] = time.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour + 5, minute, second));
  }

  private mysqlErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('driverError' in error)) return undefined;
    const driverError = (error as { driverError?: unknown }).driverError;
    if (typeof driverError !== 'object' || driverError === null || !('code' in driverError)) return undefined;
    const code = (driverError as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
}
