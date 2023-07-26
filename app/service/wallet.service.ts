import { injectable } from 'tsyringe';
import Helpers from '../lib/helpers';
import { IRequest } from '../common/Interface/IResponse';
import Wallet from '../model/wallet';
import StatusCodes from '../lib/response/status-codes';
import mongoose, { Types } from 'mongoose';
import WalletHistory from '../model/wallet-history.model';
import { IWalletHistory } from '../model/interface/IWallet';
import PaginationService from './pagination.service';

@injectable()
export class WalletService {
  pagination: PaginationService<IWalletHistory>;

  constructor() {
    this.pagination = new PaginationService(WalletHistory);
  }
  public verifyExistingWallet = async (walletId: number) => {
    try {
      const existingWallet = await Wallet.findOne({ walletId });
      return existingWallet === null ? false : true;
    } catch (err) {
      return false;
    }
  };

  public generateWalletId = async () => {
    let rand = Math.floor(100000000 + Math.random() * 900000000);
    do {
      rand = Math.floor(100000000 + Math.random() * 900000000);
    } while ((await this.verifyExistingWallet(rand)) === true);

    return rand;
  };

  public createWallet = async (user: string) => {
    try {
      const walletId = await this.generateWalletId();
      // check if user has existing wallet
      const userWallet = await Wallet.findOne({
        user: new Types.ObjectId(user),
      });
      if (userWallet)
        return Helpers.CustomException(
          StatusCodes.BAD_REQUEST,
          'A wallet already exists for this user'
        );

      const wallet = new Wallet({
        walletId,
        user: new Types.ObjectId(user),
      });
      await wallet.save();
      return Helpers.success(null);
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message || 'An unknown error occurred while trying to create wallet'
      );
    }
  };

  public creditWallet = async (req: IRequest) => {
    const { walletId, amount, description, booking } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet = await Wallet.findOne({ walletId });
      const referenceNo = Helpers.generateRef('FUND');

      // get current wallet balance and add amount to credit
      const previousBalance = wallet.balance;
      const newBalance = previousBalance + parseFloat(amount);

      const history = await WalletHistory.create(
        [
          {
            walletId: wallet.walletId,
            referenceNo,
            amount,
            description,
            booking,
            type: 'credit',
            newBalance,
          },
        ],
        { session }
      );

      // update wallet balance
      await Wallet.findByIdAndUpdate(
        wallet.id,
        { balance: newBalance },
        { session }
      );

      await session.commitTransaction();

      return Helpers.success(history[0]);
    } catch (error) {
      await session.abortTransaction();
      Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message || 'An unknown error occurred while trying to credit wallet'
      );
    }
    session.endSession();
  };

  public walletBalance = async (req: IRequest) => {
    const wallet = await Wallet.findOne({
      user: new Types.ObjectId(req.user.id),
    });
    return Helpers.success(wallet);
  };

  public walletHistory = async (req: IRequest) => {
    const wallet = await Wallet.findOne({
      user: new Types.ObjectId(req.user.id),
    });
    const query = { walletId: new Types.ObjectId(wallet._id) };
    query['sort'] = { updatedAt: 'desc' };
    const response = await this.pagination.paginate(query, [
      'walletId',
      'type',
      'referenceNo',
    ]);
    return Helpers.success(response);
  };
}
