import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { StripeService } from '../service/stripe.service';

@injectable()
class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * @route Post api/v1/payment/initialize.
   * @desc post payment intent
   * @access Public.
   */
  initializePayment = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.stripeService.initializePayment(req);
      return res.ok(
        result?.data,
        result?.message || 'Payment initialized successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to initialize payment',
        error?.code
      );
    }
  };
}

export default StripeController;
