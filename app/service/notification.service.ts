import axios, { AxiosInstance } from 'axios';
import { LoggerService } from './logger.service';
import configuration from '../config/config';
import { injectable } from 'tsyringe';

@injectable()
export class NotificationService {
  client: AxiosInstance;

  constructor(private logger: LoggerService) {
    this.client = axios.create({
      baseURL: configuration.firebase.fcm_url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${configuration.firebase.api_key}`,
      },
    });
  }

  sendNotification = async (token: string, title: string, message: string) => {
    try {
      const response = await this.client.post('/send', {
        notification: {
          title,
          body: message,
          vibrate: 1,
          sound: 1,
        },
        data: {
          name: 'pookie',
        },
        to: token,
      });
      this.logger.log(`${JSON.stringify(response.data)}`);

      if (!response.data) {
        this.logger.log(`Error: ${response.status}`);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.log(`deji3 ${error}`);
      return false;
    }
  };
}
