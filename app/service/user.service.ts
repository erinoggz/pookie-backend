import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { UserType } from '../common/Enum/userType';
import {
  ErrnoException,
  IRequest,
  IResponse,
  ISuccess,
} from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import User, { IUserModel } from '../model/user.model';
import PaginationService from './pagination.service';
import StatusCodes from '../lib/response/status-codes';
import { VerficationService } from './verification.service';
import { EventVerifier } from '@complycube/api';
import config from '../config/config';
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

  constructor(private verificationService: VerficationService) {
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
    req: any,
    res: IResponse
  ): Promise<ISuccess | ErrnoException> => {
    let event;
    console.log('webhook called', req.body);
    try {
      const signature = req.headers['complycube-signature'];
      event = eventVerifier.constructEvent(JSON.stringify(req.body), signature);
      console.log({ event });
      let status = 'unverified';
      // Handle the event
      switch (event.type) {
        case 'check.pending': {
          status = 'pending';
          break;
        }
        case 'check.failed': {
          status = 'failed';
          break;
        }
        case 'check.completed.clear': {
          status = 'verified';
          break;
        }
        case 'check.completed.rejected': {
          status = 'failed';
          break;
        }
        // ... handle other event types
        default: {
          // Unexpected event type
          return Helpers.CustomException(StatusCodes.BAD_REQUEST, null);
        }
      }
      await User.findOneAndUpdate(
        { verification_id: event.payload.id },
        { verification_satus: status },
        { new: true }
      );
      // Return a response to acknowledge receipt of the event
      return Helpers.success({ received: true });
    } catch (error) {
      return Helpers.CustomException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `Webhook Error: ${error?.message}`
      );
    }
  };
}
