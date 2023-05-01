import { injectable } from 'tsyringe';
import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import Plan from '../model/plan.model';
import { IRequest } from '../common/Interface/IResponse';

@injectable()
export class PlanService {
  public getPlans = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const plans = await Plan.find({ userType: req.user.userType });
    return Helpers.success(plans);
  };
}
