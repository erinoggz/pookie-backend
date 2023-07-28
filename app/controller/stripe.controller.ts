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

  /**
   * @route Post api/v1/payment/verify.
   * @desc get payment intent
   * @access Public.
   */
  // verifyPayment = async (req: IRequest, res: IResponse) => {
  //   try {
  //     const result = await this.stripeService.verifyPayment(req);
  //     return res.ok(
  //       result?.data,
  //       result?.message || 'Payment verified successfully!'
  //     );
  //   } catch (error) {
  //     return res.serverError(
  //       error,
  //       error?.message || 'An error occured while trying to verify payment',
  //       404
  //     );
  //   }
  // };
}

export default StripeController;
