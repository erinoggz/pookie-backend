import { injectable } from 'tsyringe';
import Helpers from '../lib/helpers';
import { IRequest } from '../common/Interface/IResponse';
import Wallet from '../model/wallet';
import Transaction from '../model/transaction-history.model';
import StatusCodes from '../lib/response/status-codes';
import mongoose, { Types } from 'mongoose';
import WalletHistory from '../model/wallet-history.model';
import { IWalletHistory } from '../model/interface/IWallet';
import PaginationService from './pagination.service';
import { StripeService } from './stripe.service';

@injectable()
export class WalletService {
  pagination: PaginationService<IWalletHistory>;

  constructor(private stripeService: StripeService) {
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

  public createWallet = async (user: string): Promise<any> => {
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
      return wallet;
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message || 'An unknown error occurred while trying to create wallet'
      );
    }
  };

  public fundWallet = async (req: IRequest) => {
    const { walletId, transactionId } = req.body;

    if (!walletId && !transactionId) {
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'walletId and transactionId are required'
      );
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet = await Wallet.findOne({ walletId });
      const referenceNo = Helpers.generateRef('FUND');

      const verifyPayment = await this.stripeService.verifyPayment(transactionId);

      // update transaction history
      await Transaction.findOneAndUpdate(
        { transactionId },
        { transactionId },
        { upsert: true, new: true }
      );

      if (verifyPayment.status !== 'succeeded') {
        return Helpers.CustomException(
          StatusCodes.UNPROCESSABLE_ENTITY,
          'An unknown error occurred while trying to fund wallet'
        );
      }

      const amount = Number(verifyPayment.amount) / 100;
      // get current wallet balance and add amount to credit
      const previousBalance = wallet.balance;
      const newBalance = previousBalance + amount;

      const history = await WalletHistory.create(
        [
          {
            walletId: wallet.walletId,
            referenceNo,
            amount,
            booking: null,
            description: 'Wallet funding',
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

  public creditWallet = async (req: IRequest) => {
    const { walletId, amount, description, booking } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet = await Wallet.findOne({ walletId });
      if (!wallet) {
        return Helpers.CustomException(StatusCodes.NOT_FOUND, 'Wallet not found');
      }
      const referenceNo = Helpers.generateRef('CREDIT');

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

  public checkWallet = async (walletId: string): Promise<number> => {
    const wallet = await Wallet.findOne({
      walletId,
    });
    return wallet.balance;
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
    const query = { walletId: wallet?.walletId };
    query['sort'] = { updatedAt: 'desc' };
    const response = await this.pagination.paginate(query, [
      'walletId',
      'type',
      'referenceNo',
    ]);
    return Helpers.success(response);
  };

  public debitWallet = async (walletId: string, amount: number, booking: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ walletId });
      if (!wallet) {
        return Helpers.CustomException(StatusCodes.NOT_FOUND, 'Wallet not found');
      }
      if (!amount) {
        return Helpers.CustomException(
          StatusCodes.BAD_REQUEST,
          'Debit amount is required!'
        );
      }
      // check if amount to be debited is available in user wallet
      if (Number(amount) > wallet.balance)
        return Helpers.CustomException(
          StatusCodes.BAD_REQUEST,
          `Wallet balance is less than ${amount}`
        );

      const referenceNo = Helpers.generateRef('DEBIT');
      // get current wallet balance and add amount to debit
      const previousBalance = wallet.balance;
      const newBalance = previousBalance - Number(amount);

      await WalletHistory.create(
        [
          {
            walletId,
            referenceNo,
            amount,
            description: 'Wallet debit',
            booking,
            type: 'debit',
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

      return true;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(error?.message);
    }
  };
}
