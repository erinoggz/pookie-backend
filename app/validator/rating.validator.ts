import { injectable } from 'tsyringe';
import { checkSchema } from 'express-validator';
import validate from '../lib/validate';

@injectable()
class RatingsValidator {
  addRatings = validate(
    checkSchema({
      merchant: {
        in: ['body'],
        isString: {
          errorMessage: 'merchant id must is required',
        },
      },
      booking: {
        in: ['body'],
        isString: {
          errorMessage: 'booking id must is required',
        },
      },
      ratingScore: {
        in: ['body'],
        isIn: {
          options: [['1', '2', '3', '4', '5']],
          errorMessage: 'Invalid rating score',
        },
      },
    })
  );
}

export default RatingsValidator;
