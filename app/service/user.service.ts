import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { UserType } from '../common/Enum/userType';
import { ErrnoException, IRequest, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import User, { IUserModel } from '../model/user.model';
import PaginationService from './pagination.service';
import StatusCodes from '../lib/response/status-codes';
import { VerficationService } from './verification.service';
import { EventVerifier } from '@complycube/api';
import config from '../config/config';
import { LoggerService } from './logger.service';
import Report from '../model/report.model';
import Constants from '../lib/constants';
const eventVerifier = new EventVerifier(config.complycube.complycube_webhook_secret);
@injectable()
export class UserService {
  pagination: PaginationService<IUserModel>;

  queryKeys: string[] = [
    'gender',
    'country',
    'state',
    'childcareCertified',
    'specialNeeds',
    'rate',
    'language',
    'ownTransport',
    'firstAid',
    'job',
    'userType',
  ];

  constructor(
    private verificationService: VerficationService,
    private logger: LoggerService
  ) {
    this.pagination = new PaginationService(User);
  }
  public getSitters = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const { min, max, srch } = req.query;
    const body = req.body;
    const query: any = req.query;
    // Set rate
    if (min || max) {
      query['rate'] = { $gte: min, $lte: max };
    }
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const filter = query[key];
        if (filter?.toLowerCase() === 'all') {
          delete query[key];
        }
      }
    }

    if (body['lang']) {
      query['language'] = { $in: body['lang'] };
    }
    if (body['lessons']) {
      query['lessons'] = { $in: body['lessons'] };
    }
    query['_id'] = { $nin: req.user.blacklist };

    query['userType'] = { $ne: UserType.parent };
    query['status'] = { $eq: true };
    if (srch) {
      const searchQuery = {
        $or: [
          { firstName: { $regex: query.srch, $options: 'i' } },
          { lastName: { $regex: query.srch, $options: 'i' } },
        ],
      };
      delete query.srch;
      if (!query.$and) query.$and = [];
      query.$and.push(searchQuery);
    }
    const select = { password: 0 };
    const response = await this.pagination.paginate(query, this.queryKeys, select);
    return Helpers.success(response);
  };

  public addGarderCheck = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { gardaCheckdoc } = req.body;

    const user = await User.findById(new Types.ObjectId(req.user.id));
    user.gardaCheckdoc = gardaCheckdoc;
    user.gardaCheck = 'pending';
    await user.save();
    return Helpers.success(null);
  };

  public deleteAccount = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    await User.findByIdAndUpdate(
      req.user.id,
      { status: false },
      { upsert: true, new: true }
    );

    return Helpers.success(null);
  };

  public complycubeVerification = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    try {
      const client = await this.verificationService.createClient(req.user);
      const session = await this.verificationService.createClientSession(client.id);
      await User.findByIdAndUpdate(
        req.user.id,
        { verification_id: client.id },
        { new: true }
      );
      return Helpers.success(session);
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        error?.message
      );
    }
  };

  public complycubeWebhook = async (
    req: any
  ): Promise<ISuccess | ErrnoException> => {
    let event;
    this.logger.log('webhook called');
    try {
      const signature = req.headers['complycube-signature'];
      event = eventVerifier.constructEvent(JSON.stringify(req.body), signature);
      // Handle the event
      switch (event.type) {
        case 'check.failed': {
          this.logger.log('check.failed event fired');
          const checkId = event.payload.id;
          const check = await this.verificationService.checkEvent(checkId);
          if (check?.clientId) {
            this.logger.log(`check.failed status updated for ${check?.clientId} `);
            await User.findOneAndUpdate(
              { verification_id: check.clientId },
              { verification_satus: 'failed' },
              { new: true }
            );
          }
          break;
        }
        case 'check.completed': {
          this.logger.log('check.failed event fired');
          const checkId = event.payload.id;
          const checkOutCome = event.payload.outcome;
          const check = await this.verificationService.checkEvent(checkId);
          if (check?.clientId) {
            this.logger.log(
              `check.completed status updated for ${check?.clientId} `
            );
            await User.findOneAndUpdate(
              { verification_id: check.clientId },
              {
                verification_satus:
                  checkOutCome === 'clear' ? 'verified' : 'pending',
              },
              { new: true }
            );
          }
          break;
        }
        case 'check.pending': {
          this.logger.log('check.failed event fired');
          const checkId = event.payload.id;
          const check = await this.verificationService.checkEvent(checkId);
          if (check?.clientId) {
            this.logger.log(`check.pending status updated for ${check?.clientId} `);
            await User.findOneAndUpdate(
              { verification_id: check.clientId },
              { verification_satus: 'pending' },
              { new: true }
            );
          }
          break;
        }
        // ... handle other event types
        default: {
          // Unexpected event type
          return Helpers.CustomException(StatusCodes.BAD_REQUEST, null);
        }
      }
      // Return a response to acknowledge receipt of the event
      return Helpers.success({ received: true });
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Webhook Error: ${error?.message}`
      );
    }
  };

  public blockAccount = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { accountId } = req.body;
    if (!accountId)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `accountId is required`
      );
    await User.updateOne(
      { _id: new Types.ObjectId(req.user.id) },
      { $addToSet: { blacklist: accountId } }
    );

    return Helpers.success(null);
  };

  public unBlockAccount = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { accountId } = req.body;
    if (!accountId)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `accountId is required`
      );
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { blacklist: accountId } },
      { upsert: true, new: true }
    );

    await User.updateOne(
      { _id: new Types.ObjectId(req.user.id) },
      { $pull: { blacklist: { $eq: new Types.ObjectId(accountId) } } }
    );

    return Helpers.success(null);
  };

  public report = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const { comment, evidence, user } = req.body;
    if (!user)
      return Helpers.CustomException(StatusCodes.BAD_REQUEST, `user is required`);
    await Report.create({
      user: new Types.ObjectId(req.user.id),
      reporting_user: user,
      comment,
      evidence,
    });

    return Helpers.success(null);
  };

  public blockedList = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const query = req.query;
    let result = [];
    if (query['blockedList'] === 'true') {
      result = await User.find({ _id: req.user.id })
        .populate([
          {
            path: 'blacklist',
            select:
              '_id firstName lastName state country address email profilePicture',
          },
        ])
        .select('_id blacklist');
      result = result[0]?.blacklist;
    }

    if (query['blockedBy'] === 'true') {
      result = await User.find({
        blacklist: { $in: req.user.id },
      }).select({
        _id: 1,
        firstName: 1,
        lastName: 1,
        state: 1,
        country: 1,
        address: 1,
        email: 1,
        profilePicture: 1,
      });
    }
    return Helpers.success({ result });
  };
}
