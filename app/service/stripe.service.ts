import { injectable } from 'tsyringe';
import { ErrnoException, IRequest, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';

import Stripe from 'stripe';
import configuration from '../config/config';

const stripe = new Stripe(configuration.stripe.stripe_secret_key, {
  apiVersion: '2022-11-15',
});

@injectable()
export class StripeService {
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
}
