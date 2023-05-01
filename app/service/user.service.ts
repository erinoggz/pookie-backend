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
    const { min, max } = req.query;
    const query = req.query;
    // Set rate
    if (min || max) {
      query['rate'] = { $gte: min, $lte: max };
    }
    query['userType'] = { $ne: UserType.PARENT };

    const response = await this.pagination.paginate(query, this.queryKeys);
    return Helpers.success(response);
  };
}
