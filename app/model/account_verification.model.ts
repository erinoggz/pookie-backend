import { model, Schema } from 'mongoose';
import { IOTPModel } from './interface/IOTPModel';

// Create the account verification schema
const AccountVerificationSchema = new Schema<IOTPModel>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    userType: {
      type: String,
      enum: Object.values(['parent', 'sitter', 'tutor']).concat([null]),
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export account verification model
const AccountVerification = model<IOTPModel>(
  'AccountVerification',
  AccountVerificationSchema
);

export default AccountVerification;
AccountVerification.syncIndexes();
