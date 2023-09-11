import { injectable } from 'tsyringe';
import { ErrnoException, IRequest, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import { LoggerService } from './logger.service';

import Stripe from 'stripe';
import configuration from '../config/config';
import StatusCodes from '../lib/response/status-codes';

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

  // public verifyPayment = async (
  //   req: IRequest
  // ): Promise<ISuccess | ErrnoException> => {
  //   const { sessionId } = req.query;
  //   const checkout = await stripe.paymentIntents.retrieve(String(sessionId));
  //   return Helpers.success(checkout);
  // };

  public verifyPayment = async (transactionId: string): Promise<any> => {
    const checkout = await stripe.paymentIntents.retrieve(String(transactionId));
    return checkout;
    // return Helpers.success(checkout);
  };

  public issuePayout = async (req: IRequest) => {
    try {
      const { amount, bankAccountToken, acctID } = req.body;

      // const externalAccount = await stripe.accounts.createExternalAccount(
      //   'acct_1NVRmtGFKVSTADSs',
      //   {
      //     external_account: bankAccountToken,
      //   }
      // );
      // const externalAccount = await stripe.accounts.create({
      //   type: 'express',
      // });

      const accountLink = await stripe.accountLinks.create({
        account: acctID,
        refresh_url: 'https://example.com/reauth',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });

      console.log({ accountLink });
      // const payout = await stripe.payouts.create(
      //   {
      //     amount: Number(amount) * 100, // The amount in cents (e.g., 1000 for $10.00)
      //     currency: 'EUR', // Change to your desired currency code (e.g., 'eur' for Euro)
      //     destination: bankAccountToken, // The bank account token you want to send the payout to,
      //     source_type: 'card',
      //     method: 'instant',
      //   },
      //   { stripeAccount: 'acct_1NVRmtGFKVSTADSs' }
      // );

      // this.logger.log(`Payout created: ${payout}`);
      return Helpers.success(accountLink);
    } catch (error) {
      this.logger.error(`Error creating payout: ${error}`);
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message
      );
    }
  };

  // public createCardToken = async (req: IRequest) => {
  //   try {
  //     const cardData = {
  //       number: '4242424242424242',
  //       exp_month: 12,
  //       exp_year: 2024,
  //       cvc: '123',
  //     };
  //     const payout = await stripe.tokens.create({
  //       card: cardData,
  //     });

  //     this.logger.log(`card created: ${payout}`);
  //     return Helpers.success(payout);
  //   } catch (error) {
  //     this.logger.error(`Error creating card: ${error}`);
  //     return Helpers.CustomException(
  //       StatusCodes.UNPROCESSABLE_ENTITY,
  //       error?.message
  //     );
  //   }
  // };
}
