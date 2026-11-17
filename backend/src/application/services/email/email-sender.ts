import nodemailer from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export class SmtpEmailSender implements IEmailSender {
  private readonly transporter;

  constructor(private readonly config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user ? { auth: { user: config.user, pass: config.pass } } : {}),
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({ from: this.config.from, ...message });
  }
}

/**
 * Usado quando não há SMTP configurado (desenvolvimento): o e-mail, incluindo
 * o código de verificação, aparece no log do backend.
 */
export class ConsoleEmailSender implements IEmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(
      `[email] SMTP não configurado; e-mail não enviado.\nPara: ${message.to}\nAssunto: ${message.subject}\n${message.text}`,
    );
  }
}

export function createEmailSender(config: SmtpConfig | undefined): IEmailSender {
  return config ? new SmtpEmailSender(config) : new ConsoleEmailSender();
}
