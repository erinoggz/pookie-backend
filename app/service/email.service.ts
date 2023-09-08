import nodemailer from 'nodemailer';
import config from '../config/config';
import { injectable } from 'tsyringe';
import { LoggerService } from './logger.service';

@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private logger: LoggerService) {
    this.transporter = nodemailer.createTransport({
      name: config.smtp.name,
      host: config.smtp.host,
      port: config.smtp.port,
      secure: true,
      auth: {
        user: config.smtp.auth,
        pass: config.smtp.pass,
      },
    });
  }

  async sendEmail(to: string, html: string, subject?: string, sender?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: sender || config.smtp.sender,
        to,
        subject: subject || 'Hello',
        html,
      });
      this.logger.log(`Message sent: ${JSON.stringify(info)}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${JSON.stringify(error)}`);
    }
  }
}
