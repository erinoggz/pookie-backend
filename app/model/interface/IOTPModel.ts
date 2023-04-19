import { Document, Types } from 'mongoose';

export interface IOTPModel extends Document {
  _id: Types.ObjectId;
  email: string;
  userType: 'PARENT' | 'SITTER' | 'GRIND';
  otp: string;
  expiresAt: Date;
}
