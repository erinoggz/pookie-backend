import { injectable } from 'tsyringe';
import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import Plan from '../model/plan.model';

@injectable()
export class PlanService {
  public getPlans = async (): Promise<ISuccess | ErrnoException> => {
    const plans = await Plan.find();
    return Helpers.success(plans);
  };
}
