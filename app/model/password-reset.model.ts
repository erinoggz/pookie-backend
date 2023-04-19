import { model, Schema } from 'mongoose';
import { IOTPModel } from './interface/IOTPModel';

// Create the password reset schema
const PasswordResetSchema = new Schema<IOTPModel>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.values(['PARENT', 'SITTER', 'GRIND']).concat([null]),
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

// Create and export password reset model
const PasswordReset = model<IOTPModel>('PasswordReset', PasswordResetSchema);

export default PasswordReset;
