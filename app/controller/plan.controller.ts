import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { PlanService } from '../service/plan.service';

@injectable()
class PlanController {
  constructor(private planService: PlanService) {}

  /**
   * @route GET api/v1/plan
   * @desc get plans endpoint
   * @access Public.
   */
  getPlans = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.planService.getPlans(req);
      return res.ok(result?.data, result?.message || 'Plans fetched successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fetch plans',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/plan/upgrade
   * @desc post upgrade plan endpoint
   * @access Public.
   */
  upgradeSubscription = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.planService.upgradeSubscription(req);
      return res.ok(result?.data, result?.message || 'Plan upgraded successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to upgrade plan',
        error?.code
      );
    }
  };
}

export default PlanController;
