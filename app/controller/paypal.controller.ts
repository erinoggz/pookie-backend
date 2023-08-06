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
      return res.ok(
        result?.data,
        result?.message ||
          'Payout issued successfully!. You will be notified of your withdrawal status'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to issue payout',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/paypal/payout
   * @desc get all bookings endpoint
   * @access Public.
   */
  payoutHistory = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.paypalService.payoutHistory(req);
      return res.ok(
        result?.data,
        result?.message || 'Payout history fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fetch payout history',
        error?.code
      );
    }
  };
}

export default PaypalController;
