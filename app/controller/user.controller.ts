import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { UserService } from '../service/user.service';
import config from '../config/config';
import { EventVerifier } from '@complycube/api';
import StatusCodes from '../lib/response/status-codes';
const eventVerifier = new EventVerifier(config.complycube.complycube_webhook_secret);

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
      return res.ok(
        result?.data,
        result?.message || 'verification initiated successfully!'
      );
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
  complycubeWebhook = async (req: any, res: IResponse) => {
    let event;
    console.log({ webhook: 'webhook called oooooooooo' });
    try {
      const signature = req.headers['complycube-signature'];
      event = eventVerifier.constructEvent(JSON.stringify(req.body), signature);
      console.log({ event });
      switch (event.type) {
        case 'check.completed': {
          const checkId = event.payload.id;
          const checkOutCome = event.payload.outcome;
          console.log(`Check ${checkId} completed with outcome ${checkOutCome}`);
          console.log('payload', event.payload);
          break;
        }
        case 'check.pending': {
          const checkId = event.payload.id;
          console.log(`Check ${checkId} is pending`);
          break;
        }
        case 'check.failed': {
          const checkId = event.payload.id;
          console.log(`Check ${checkId} is failed`);
          break;
        }
        case 'check.completed.clear': {
          const checkId = event.payload.id;
          console.log(`Check ${event.payload} is check.completed.clear`);
          break;
        }
        case 'check.completed.rejected': {
          const checkId = event.payload.id;
          console.log(`Check ${event.payload} is check.completed.rejected`);
          break;
        }
        // ... handle other event types
        default: {
          // Unexpected event type
          return res.serverError(
            null,
            'An error occured while trying to run webhook',
            StatusCodes.BAD_REQUEST
          );
        }
      }
      // return res.ok(result?.data, result?.message || 'Webhook fired successfully!');
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
