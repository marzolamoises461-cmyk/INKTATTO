import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

export interface EmailContent {
  recipientEmail: string;
  subject: string;
  textBody: string;
}

interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  user?: string;
  password?: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return this.readSettings() !== null;
  }

  async send(email: EmailContent): Promise<void> {
    const settings = this.readSettings();
    if (!settings) {
      throw new ServiceUnavailableException(
        'El correo no está configurado. Define SMTP_HOST, SMTP_PORT, SMTP_FROM y las credenciales SMTP.',
      );
    }
    await this.createTransport(settings).sendMail({
      from: settings.from,
      to: email.recipientEmail,
      subject: email.subject,
      text: email.textBody,
    });
  }

  private readSettings(): SmtpSettings | null {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const portValue = this.config.get<string>('SMTP_PORT')?.trim();
    const from = this.config.get<string>('SMTP_FROM')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const password = this.config.get<string>('SMTP_PASSWORD');
    if (!host && !portValue && !from && !user && !password) return null;
    const port = Number(portValue);
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from || Boolean(user) !== Boolean(password)) {
      throw new ServiceUnavailableException('La configuración SMTP está incompleta o es inválida.');
    }
    return {
      host,
      port,
      secure: this.config.get<string>('SMTP_SECURE') === 'true',
      from,
      ...(user ? { user, password } : {}),
    };
  }

  private createTransport(settings: SmtpSettings): Transporter {
    return createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      ...(settings.user && settings.password ? { auth: { user: settings.user, pass: settings.password } } : {}),
      connectionTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
}
