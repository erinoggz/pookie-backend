import { injectable } from 'tsyringe';
import { checkSchema } from 'express-validator';
import validate from '../lib/validate';
import User from '../model/user.model';
import { UserType } from '../common/Enum/userType';

@injectable()
class AuthValidator {
  login = validate(
    checkSchema({
      email: {
        in: ['body'],
        isString: {
          errorMessage: 'Email must be a string',
        },
        isEmail: {
          errorMessage: 'Email is not valid',
        },
        trim: true,
      },
      password: {
        in: ['body'],
        trim: true,
        isString: {
          errorMessage: 'Password must be a string',
        },
      },
    })
  );

  register = validate(
    checkSchema({
      firstName: {
        in: ['body'],
        isString: {
          errorMessage: 'Firstname must be a string',
        },
        isLength: {
          options: {
            min: 2,
          },
          errorMessage: 'Firstname must have minimum of two characters',
        },
        trim: true,
      },
      lastName: {
        in: ['body'],
        isString: {
          errorMessage: 'Lastname must be a string',
        },
        isLength: {
          options: {
            min: 2,
          },
          errorMessage: 'Lastname must have minimum of two characters',
        },
        trim: true,
      },
      email: {
        in: ['body'],
        isEmail: {
          errorMessage: 'Input a valid email',
        },
        trim: true,
      },
      password: {
        in: ['body'],
        isString: {
          errorMessage: 'Password must be a string',
        },
        isLength: {
          options: {
            min: 8,
          },
          errorMessage: 'Password must have minimum of eight characters',
        },
      },
      phoneNumber: {
        in: ['body'],
        isLength: {
          options: {
            min: 2,
          },
          errorMessage: 'Phone Number must have minimum of two numbers',
        },
        trim: true,
        custom: {
          options: async (value) => {
            const user = await User.findOne({ phoneNumber: value });
            if (user) {
              throw new Error('Phone Number already in use by another user');
            }
          },
        },
      },
      userType: {
        in: ['body'],
        isString: {
          errorMessage: 'User Type must be a string',
        },
        custom: {
          options: async (value) => {
            const userTypes = Object.values(UserType);
            if (!userTypes.includes(value)) {
              throw new Error('Invalid User Type');
            }
          },
        },
        trim: true,
      },
    })
  );

  verify = validate(
    checkSchema({
      email: {
        in: ['body'],
        isString: {
          errorMessage: 'Email must be a string',
        },
        isEmail: {
          errorMessage: 'Email is not valid',
        },
        trim: true,
      },
      code: {
        in: ['body'],
        isLength: {
          options: {
            min: 6,
            max: 6,
          },
          errorMessage: 'OTP must have a min and max of 6 characters',
        },
        trim: true,
      },
    })
  );

  resendOTP = validate(
    checkSchema({
      email: {
        in: ['body'],
        isString: {
          errorMessage: 'Email must be a string',
        },
        isEmail: {
          errorMessage: 'Email is not valid',
        },
        trim: true,
      },
    })
  );

  forgot = validate(
    checkSchema({
      email: {
        in: ['body'],
        isString: {
          errorMessage: 'Email must be a string',
        },
        isEmail: {
          errorMessage: 'Email is not valid',
        },
        trim: true,
      },
    })
  );

  reset = validate(
    checkSchema({
      email: {
        in: ['body'],
        isString: {
          errorMessage: 'Email must be a string',
        },
        isEmail: {
          errorMessage: 'Email is not valid',
        },
        trim: true,
      },
      code: {
        in: ['body'],
        isLength: {
          options: {
            min: 6,
            max: 6,
          },
          errorMessage: 'OTP must have a min and max of 6 characters',
        },
        trim: true,
      },
      newPassword: {
        in: ['body'],
        isString: {
          errorMessage: 'Password must be a string',
        },
        isLength: {
          options: {
            min: 8,
          },
          errorMessage: 'Password must have minimum of eight characters',
        },
      },
    })
  );

  change = validate(
    checkSchema({
      newPassword: {
        in: ['body'],
        isString: {
          errorMessage: 'New Password must be a string',
        },
        isLength: {
          options: {
            min: 8,
          },
          errorMessage: 'New Password must have minimum of eight characters',
        },
      },
      oldPassword: {
        in: ['body'],
        isString: {
          errorMessage: 'Old Password must be a string',
        },
      },
    })
  );
}

export default AuthValidator;
