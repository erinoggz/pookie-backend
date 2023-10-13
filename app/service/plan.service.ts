import { injectable } from 'tsyringe';
import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import Plan from '../model/plan.model';
import Subscription from '../model/subscription.model';
import { IRequest } from '../common/Interface/IResponse';
import { Types } from 'mongoose';
import Constants from '../lib/constants';
import { PlanType } from '../common/Enum/plan';
import { StatusType } from '../common/Enum/bookingStatus';
import User, { IUserModel } from '../model/user.model';
import { UserType } from '../common/Enum/userType';
import PaginationService from './pagination.service';
import plans from '../seeds/data/plan/plan';
import { WalletService } from './wallet.service';
import { StripeService } from './stripe.service';
import TransactionHistory from '../model/transaction-history.model';
import StatusCodes from '../lib/response/status-codes';

@injectable()
export class PlanService {
  pagination: PaginationService<IUserModel>;
  constructor(
    private walletService: WalletService,
    private stripeService: StripeService
  ) {
    this.pagination = new PaginationService(User);
  }
  public getPlans = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    let userType = req.user.userType;
    if (userType === UserType.tutor) {
      userType = UserType.sitter;
    }
    const plans = await Plan.find({ userType });
    return Helpers.success(plans);
  };

  public upgradeSubscription = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { planId, walletId, transactionId, appleTransID, amount } = req.body;
    if (!walletId && !transactionId && !appleTransID) {
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'walletId, transactionId, or appleTransID is required'
      );
    }
    const currentPlan = await Plan.findById(new Types.ObjectId(planId));
    if (walletId) {
      await this.walletService.debitWallet(
        walletId,
        amount,
        null,
        'Subscription fee'
      );
    }
    if (transactionId) {
      const verifyPayment = await this.stripeService.verifyPayment(transactionId);

      // update transaction history
      await TransactionHistory.findOneAndUpdate(
        { transactionId },
        { transactionId, booking: null, transactionType: 'stripe' },
        { upsert: true, new: true }
      );
      if (verifyPayment.status !== 'succeeded') {
        return Helpers.CustomException(
          StatusCodes.UNPROCESSABLE_ENTITY,
          'Unable to upgrage plan. Payment not successful.'
        );
      }
    }

    if (appleTransID) {
      // update transaction history
      await TransactionHistory.findOneAndUpdate(
        { transactionId: appleTransID },
        { transactionId: appleTransID, transactionType: 'apple', booking: null },
        { upsert: true, new: true }
      );
    }
    let duration = 0;

    if (currentPlan.interval === 'monthly') {
      duration = Constants.monthly;
    }
    if (currentPlan.interval === 'annually') {
      duration = Constants.annually;
    }

    if (currentPlan.interval === 'none') {
      duration = 1087327;
    }
    const previous_sub: any = await Subscription.findOne({
      user: req.user.id,
    }).populate('plan');
    if (previous_sub) {
      let daysLeft = Helpers.dateDiffInDays(new Date(), previous_sub.expiry_date);
      if (daysLeft <= 0) {
        daysLeft = 0;
      }
      if (daysLeft > 0 && previous_sub.plan.plan_type !== PlanType.free) {
        duration += daysLeft;
      }

      const { start, end } = Helpers.getDurationRange(duration);
      await Subscription.findOneAndUpdate(
        { user: req.user.id },
        {
          name: currentPlan.name,
          plan: currentPlan._id,
          duration,
          amount: currentPlan.amount,
          start_date: start,
          expiry_date: end,
          currency: currentPlan.currency,
          status: StatusType.active,
        },
        { upsert: true, new: true }
      );
    }
    return Helpers.success(null);
  };

  public validateParentSubscriptions = async (page = 1) => {
    const query = {};
    query['userType'] = { $eq: UserType.parent };
    query['page'] = page;
    query['limit'] = 1000;
    const plan_code = plans[0].plan_code;
    const plan = await Plan.findOne({ plan_code });

    const result = await this.pagination.paginate<IUserModel>(query, []);

    for (const item of result.data) {
      await Subscription.updateOne(
        {
          expiry_date: { $lt: new Date() },
          user: new Types.ObjectId(item._id),
        },
        {
          $set: {
            name: plan.name,
            plan: plan._id,
            amount: plan.amount,
            start_date: new Date(),
            expiry_date: new Date('5000-07-26T09:06:23.736+00:00'),
            currency: plan.currency,
            status: StatusType.active,
          },
        }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateParentSubscriptions(page + 1);
    }
  };

  public validateSitterSubscriptions = async (page = 1) => {
    const query = {};
    query['userType'] = { $ne: UserType.parent };
    query['page'] = page;
    query['limit'] = 1000;
    const plan_code = plans[1].plan_code;
    const plan = await Plan.findOne({ plan_code });

    const result = await this.pagination.paginate<IUserModel>(query, []);

    for (const item of result.data) {
      await Subscription.updateOne(
        {
          expiry_date: { $lt: new Date() },
          user: new Types.ObjectId(item._id),
        },
        {
          $set: {
            name: plan.name,
            plan: plan._id,
            amount: plan.amount,
            start_date: new Date(),
            expiry_date: new Date('5000-07-26T09:06:23.736+00:00'),
            currency: plan.currency,
            status: StatusType.active,
          },
        }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateSitterSubscriptions(page + 1);
    }
  };
}
