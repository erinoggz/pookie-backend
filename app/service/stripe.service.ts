import { injectable } from 'tsyringe';
import { ErrnoException, IRequest, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import { LoggerService } from './logger.service';

import Stripe from 'stripe';
import configuration from '../config/config';
import StatusCodes from '../lib/response/status-codes';
import moment from 'moment';

const stripe = new Stripe(configuration.stripe.stripe_secret_key, {
  apiVersion: '2022-11-15',
});

@injectable()
export class StripeService {
  constructor(private logger: LoggerService) {}
  public initializePayment = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'test product',
            },
            unit_amount: 1000 * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:9099/me/billing?success=true&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:9099/me/billing?success=false`,
      customer_email: String(req.user.email),
    });
    return Helpers.success(session);
  };

  public account = async (email: string, state?: string): Promise<any> => {
    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'GB',
      email,
      business_type: 'individual',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      default_currency: 'eur',
    });
    return account;
  };

  public verifyPayment = async (transactionId: string): Promise<any> => {
    const checkout = await stripe.paymentIntents.retrieve(String(transactionId));
    return checkout;
  };

  public updateAccount = async (accountID: string, ip: string): Promise<any> => {
    const time = moment.utc().valueOf();
    const date = Math.floor(time / 1000);

    try {
      const account = await stripe.accounts.update(`${accountID}`, {
        tos_acceptance: {
          date,
          ip,
        },
      });
      return account;
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message
      );
    }
  };

  public issuePayout = async (req: IRequest) => {
    try {
      const transfer = await stripe.transfers.create({
        amount: Number(req.body.amount),
        currency: 'eur',
        destination: `${req.user.stripeAcct}`,
      });
      return transfer;
    } catch (error) {
      this.logger.error(`Error creating payout: ${error}`);
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message,
        'stripe'
      );
    }
  };
}
