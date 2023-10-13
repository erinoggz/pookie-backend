import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { StripeService } from '../service/stripe.service';
import { WalletService } from '../service/wallet.service';
import { NotificationService } from '../service/notification.service';

@injectable()
class StripeController {
  constructor(
    private stripeService: StripeService,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {}

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
   * @route Post api/v1/payment/payout.
   * @desc post payout
   * @access Public.
   */
  issuePayout = async (req: IRequest, res: IResponse) => {
    try {
      await this.walletService.debitWallet(
        req.user.wallet,
        Number(req.body.amount),
        null,
        'Payout debit'
      );
      const result = await this.stripeService.issuePayout(req);
      await this.notificationService.sendNotification(
        req.user.device_token,
        'Payout success',
        `Withdrawal of €${req.body.amount} was successful`
      );
      return res.ok(result, 'Payment issued successfully!');
    } catch (error) {
      console.error('Error creating payout:');
      if (error?.source === 'stripe') {
        await this.walletService.creditWallet(
          req.user.wallet,
          Number(req.body.amount),
          null,
          'Payout refund'
        );
        await this.notificationService.sendNotification(
          req.user.device_token,
          'Wallet refund',
          `Your wallet has been refunded with €${Number(req.body.amount)}`
        );
      }
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to issue payout',
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
