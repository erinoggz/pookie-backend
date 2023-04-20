import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { model, Schema } from 'mongoose';
import configuration from '../config/config';
import { IUser } from './interface/IUser';

// Create the model schema & register your custom methods here
export interface IUserModel extends IUser {
  comparePassword(password: string): Promise<boolean>;
  generateJWT(expiresIn: string): string;
}

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
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'NOT_SPECIFIED'],
      default: 'NOT_SPECIFIED',
    },
    userType: {
      type: String,
      enum: Object.values(['PARENT', 'SITTER', 'GRIND']).concat([null]),
    },
    job: {
      type: String,
      enum: Object.values(['SITTER', 'AU_PAIR', 'NANNY', 'GRIND']).concat([null]),
    },
    lookingFor: {
      type: String,
      enum: Object.values(['SITTER', 'AU_PAIR', 'NANNY', 'GRIND']).concat([null]),
    },
    meansOfVerification: {
      type: String,
      enum: Object.values([
        'INTERNATIONAL_PASSPORT',
        'DRIVERS_LICENSE',
        'NATIONAL_IDENTITY_CARD',
      ]).concat([null]),
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OTHERS'],
      default: 'OTHERS',
    },
    profilePicture: String,
    firstName: String,
    lastName: String,
    address: String,
    aboutMe: String,
    state: String,
    country: String,
    noOfChildren: String,
    specialNeeds: String,
    userVerifiedAt: Date,
    pets: [],
    profileSetupComplete: {
      type: Boolean,
      default: false,
    },
    rate: String,
    language: String,
    firstAid: String,
    childcareCertification: String,
    cpr: String,
    ownTransport: String,
    googleId: String,
    facebookId: String,
    lastLogin: Date,
    status: {
      type: Boolean,
      default: true,
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
UserSchema.methods.generateJWT = function (expiresIn: string): string {
  const payload = {
    id: this._id,
    email: this.email,
    userType: this.userType,
  };

  return jwt.sign(payload, configuration.web.jwt_secret, {
    expiresIn,
  });
};

// Create and export user model
const User = model<IUserModel>('Users', UserSchema);

export default User;
User.syncIndexes();
