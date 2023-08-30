import { injectable } from 'tsyringe';
import { ComplyCube } from '@complycube/api';
import Helpers from '../lib/helpers';
import StatusCodes from '../lib/response/status-codes';
import { IUser } from '../model/interface/IUser';
import config from '../config/config';

const complycube = new ComplyCube({ apiKey: config.complycube.complycube_api_key });

@injectable()
export class VerficationService {
  createClient = async (user: IUser): Promise<any> => {
    try {
      const client = await complycube.client.create({
        type: 'person',
        email: user?.email,
        personDetails: {
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
      });
      return client;
    } catch (error) {
      console.log({ error });
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message
      );
    }
  };

  createClientSession = async (CLIENT_ID: string) => {
    try {
      const session = await complycube.flow.createSession(`${CLIENT_ID}`, {
        checkTypes: [
          'extensive_screening_check',
          'identity_check',
          'document_check',
        ],
        successUrl: 'https://www.yoursite.com/success',
        cancelUrl: 'https://www.yoursite.com/cancel',
        theme: 'light',
      });
      return session;
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message
      );
    }
  };
}
