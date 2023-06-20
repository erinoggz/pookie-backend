import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { RatingsService } from '../service/ratings.service';

@injectable()
class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  /**
   * @route POST api/v1/rating
   * @desc rate booking endpoint
   * @access Public.
   */
  addRatings = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.ratingsService.addRatings(req);
      return res.ok(result?.data, result?.message || 'Ratings added successfully!');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to rate booking',
        error?.code
      );
    }
  };
}

export default RatingsController;
