import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { IRequest } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import paypal from 'paypal-rest-sdk';
import StatusCodes from '../lib/response/status-codes';
import config from '../config/config';
import Payout from '../model/payout.model';
import { IPayoutModel } from '../model/interface/IPayoutModel';
import PaginationService from './pagination.service';
import { NotificationService } from './notification.service';
import { WalletService } from './wallet.service';
import User from '../model/user.model';

paypal.configure({
  mode: 'sandbox', // Use 'sandbox' for testing and 'live' for production
  client_id: `${config.paypal.client_id}`,
  client_secret: `${config.paypal.client_secret}`,
});

@injectable()
export class PaypalService {
  pagination: PaginationService<IPayoutModel>;

  constructor(
    private notificationService: NotificationService,
    private walletService: WalletService
  ) {
    this.pagination = new PaginationService(Payout);
  }

  async payout(req: IRequest) {
    const { email, amount } = req.body;
    console.log('user:', req.user);
    if (!email && !amount) {
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'paypal email and amount is required'
      );
    }
    try {
      const batch_id = uuidv4();
      const payout = {
        sender_batch_header: {
          sender_batch_id: batch_id,
          email_subject: 'Payment from Your Business',
          recipient_type: 'EMAIL',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: req.body.amount,
              currency: 'GBP',
            },
            receiver: req.body.email,
            note: 'Thank you for your payment!',
            sender_item_id: 'POOKIE(A)',
          },
        ],
      };
      await this.walletService.debitWallet(
        req.user.wallet,
        0.17,
        null,
        'Paypal Payout fee'
      );
      await this.walletService.debitWallet(
        req.user.wallet,
        amount,
        null,
        'Payout debit'
      );
      const createdPayout: any = await new Promise((resolve, reject) => {
        paypal.payout.create(payout, function (error: any, payout: any) {
          if (error) {
            reject(error);
          } else {
            resolve(payout);
          }
        });
      });

      await Payout.findOneAndUpdate(
        { batchId: createdPayout.batch_header.payout_batch_id },
        {
          batchStatus: createdPayout?.batch_header?.batch_status,
          user: req.user.id,
          wallet: req.user.wallet,
          amount,
        },
        { new: true, upsert: true }
      );

      console.log('Payout created:', createdPayout);
      return Helpers.success(createdPayout);
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * resolve status of payout
   * @param payout - an instance of payout
   */
  async checkStatus(payout) {
    // if payout is pending, check payment gateway for updated status,
    // if status has been resolved, update the status on the payout

    if (
      payout.batchStatus === 'PENDING' ||
      payout.batchStatus === 'PROCESSING' ||
      payout.batchStatus === 'SUCCESS'
    ) {
      try {
        const payoutBatch: any = await new Promise((resolve, reject) => {
          paypal.payout.get(payout.batchId, function (error: any, payoutBatch: any) {
            if (error) {
              reject(error);
            } else {
              resolve(payoutBatch);
            }
          });
        });

        if (payoutBatch.batch_header.batch_status === 'SUCCESS') {
          await Payout.findOneAndUpdate(
            { batchId: payout.batchId },
            {
              batchStatus: payoutBatch?.batch_header?.batch_status,
              resolved: true,
              resolvedAt: new Date(),
            },
            { new: true }
          );
          const user = await User.findById(payout.user);

          await this.notificationService.sendNotification(
            user.device_token,
            'Payout success',
            `Withdrawal of £${payout.amount} was successful`
          );
        } else {
          await Payout.findOneAndUpdate(
            { batchId: payout.batchId },
            {
              batchStatus: payoutBatch?.batch_header?.batch_status,
            },
            { new: true }
          );
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      await Payout.findOneAndUpdate(
        { batchId: payout.batchId },
        {
          batchStatus: 'FAILED',
          resolved: true,
          resolvedAt: new Date(),
        },
        { new: true }
      );
      await this.walletService.creditWallet(
        payout.wallet,
        payout.amount + 0.17,
        null,
        'Payout refund'
      );
    }
  }

  public validatePayout = async (page = 1) => {
    const query = {};
    query['resolved'] = { $eq: false };
    query['resolvedAt'] = { $exists: false };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IPayoutModel>(query, []);

    for (const item of result.data) {
      await this.checkStatus(item);
    }

    if (result.meta.page < result.meta.pages) {
      await this.validatePayout(page + 1);
    }
  };
}
