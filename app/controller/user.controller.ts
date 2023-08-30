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

  /**
   * @route PUT api/v1/user/garda-check.
   * @desc PUT user
   * @access Public.
   */
  addGarderCheck = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.userService.addGarderCheck(req);
      return res.ok(
        result?.data,
        result?.message || 'Garder check added successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to add garder check',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/user/verify.
   * @desc GET verification status
   * @access Public.
   */
  complycubeVerification = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.userService.complycubeVerification(req);
      return res.ok(result?.data, result?.message || 'User verified successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to verify user',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/user/comply/webhook.
   * @desc GET webhook
   * @access Public.
   */
  complycubeWebhook = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.userService.complycubeWebhook(req, res);
      return res.ok(result?.data, result?.message || 'Webhook fired successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to run webhook',
        error?.code
      );
    }
  };
}

export default UserController;
