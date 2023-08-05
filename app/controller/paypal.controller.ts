import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { PaypalService } from '../service/paypal.service';

@injectable()
class PaypalController {
  constructor(private paypalService: PaypalService) {}
  /**
   * @route Post api/v1/paypal/payout.
   * @desc post payout
   * @access Public.
   */
  issuePayout = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.paypalService.payout(req);
      return res.ok(result?.data, result?.message || 'Payment issued successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to issue payout',
        error?.code
      );
    }
  };
}

export default PaypalController;
