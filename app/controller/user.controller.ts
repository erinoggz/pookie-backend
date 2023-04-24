import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { UserService } from '../service/user.service';

@injectable()
class UserController {
  constructor(private userService: UserService) {}

  /**
   * @route GET api/v1/user/sitters.
   * @desc Get sitters
   * @access Public.
   */
  getSitters = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.userService.getSitters(req);
      return res.ok(
        result?.data,
        result?.message || 'sitters fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fetch sitters',
        error?.code
      );
    }
  };
}

export default UserController;
