import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { UserType } from '../common/Enum/userType';
import { ErrnoException, IRequest, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import User, { IUserModel } from '../model/user.model';
import PaginationService from './pagination.service';

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

  constructor() {
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
    query['userType'] = { $eq: UserType.sitter };
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
}
