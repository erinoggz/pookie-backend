import { injectable } from 'tsyringe';
import { checkSchema } from 'express-validator';
import validate from '../lib/validate';

@injectable()
class BookingValidator {
  createBooking = validate(
    checkSchema({
      merchantId: {
        in: ['body'],
        isString: {
          errorMessage: 'merchantId must be a string',
        },
      },
      userId: {
        in: ['body'],
        isString: {
          errorMessage: 'userId must be a string',
        },
      },
      startDate: {
        in: ['body'],
        isString: {
          errorMessage: 'startDate must be a string',
        },
      },
      endDate: {
        in: ['body'],
        isString: {
          errorMessage: 'endDate must be a string',
        },
      },
      address: {
        in: ['body'],
        isString: {
          errorMessage: 'address must be a string',
        },
      },
    })
  );
}

export default BookingValidator;
