import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { WalletService } from '../service/wallet.service';

@injectable()
class WalletController {
  constructor(private walletService: WalletService) {}

  /**
   * @route GET api/v1/wallet/balance
   * @desc get wallet balance endpoint
   * @access Public.
   */
  walletBalance = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.walletService.walletBalance(req);
      return res.ok(
        result?.data,
        result?.message || 'Wallet history balance fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to wallet balance',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/wallet/fund
   * @desc post fund wallet endpoint
   * @access Public.
   */
  fundWallet = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.walletService.fundWallet(req);
      return res.ok(result?.data, result?.message || 'Wallet funded successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fund wallet',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/wallet/history
   * @desc get wallet history endpoint
   * @access Public.
   */
  walletHistory = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.walletService.walletHistory(req);
      return res.ok(
        result?.data,
        result?.message || 'Wallet history fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to wallet history',
        error?.code
      );
    }
  };
}

export default WalletController;
