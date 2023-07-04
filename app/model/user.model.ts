import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { model, Schema, plugin } from 'mongoose';
import { IUser } from './interface/IUser';
import slugGenerator from 'mongoose-slug-generator';

// Create the model schema & register your custom methods here
export interface IUserModel extends IUser {
  comparePassword(password: string): Promise<boolean>;
  generateJWT(expiresIn: string, secret: string): string;
}

plugin(slugGenerator, {
  separator: '-',
  lang: 'en',
  truncate: 120,
});

// Create the user schema
const UserSchema = new Schema<IUserModel>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    referredBy: {
      type: String,
    },
    current_subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    urlKey: { type: String, slug: ['firstName', 'lastName'], unique: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'not_specified'],
      default: 'not_specified',
    },
    userType: {
      type: String,
      enum: Object.values(['parent', 'sitter', 'grind']).concat([null]),
    },
    job: {
      type: String,
      enum: Object.values(['sitter', 'au_pair', 'nanny', 'grind']).concat([null]),
    },
    lookingFor: {
      type: String,
      enum: Object.values(['sitter', 'au_pair', 'nanny', 'grind']).concat([null]),
    },
    meansOfVerification: {
      type: String,
      enum: Object.values([
        'international_passport',
        'drivers_license',
        'national_identity_card',
      ]).concat([null]),
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'not_available'],
      default: 'available',
    },
    profilePicture: String,
    firstName: String,
    lastName: String,
    address: String,
    device_token: String,
    aboutMe: String,
    state: String,
    country: String,
    noOfChildren: String,
    specialNeeds: String,
    userVerifiedAt: Date,
    pets: String,
    dateOfBirth: String,
    training: String,
    smoker: {
      type: Boolean,
      default: false,
    },
    gardaCheck: {
      type: String,
      enum: ['pending', 'verified', 'unverified'],
      default: 'unverified',
    },
    experience: String,
    ownCar: {
      type: Boolean,
      default: false,
    },
    rate: String,
    language: [String],
    firstAid: {
      type: Boolean,
      default: false,
    },
    childcareCertified: {
      type: Boolean,
      default: false,
    },
    childcareCertification: String,
    cpr: String,
    ownTransport: {
      type: Boolean,
      default: false,
    },
    googleId: String,
    facebookId: String,
    lastLogin: Date,
    status: {
      type: Boolean,
      default: true,
    },

    gardaCheckdoc: {
      type: String,
    },
    ratings: {
      reviewCount: {
        type: Number,
        default: 0,
      },
      averageRatings: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash user's password before user is created.
 */
UserSchema.pre<IUserModel>('save', async function (_next) {
  if (!this.isModified('password')) return _next();
  try {
    this.password = await argon2.hash(this.password);
    return _next();
  } catch (_err) {
    if (_err) return _next(_err);
  }
});

/**
 * Compares the user's password with the request password.
 * @param  {string} password The user password.
 * @return {boolean} If password is correct returns true, else false.
 */
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return argon2.verify(this.password, password);
};

/**
 * Generates JWT token for user.
 * @return {string} The generated user JWT.
 */
UserSchema.methods.generateJWT = function (
  expiresIn: string,
  secret: string
): string {
  const payload = {
    id: this._id,
    email: this.email,
    userType: this.userType,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

// Create and export user model
const User = model<IUserModel>('Users', UserSchema);

export default User;

UserSchema.index({
  userType: 1,
  gender: 1,
  country: 1,
  state: 1,
  childcareCertified: 1,
  specialNeeds: 1,
  rate: 1,
  ownTransport: 1,
  firstAid: 1,
  job: 1,
});

User.syncIndexes();
