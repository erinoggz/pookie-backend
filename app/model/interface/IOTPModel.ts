import { Document, Types } from 'mongoose';

export interface IOTPModel extends Document {
  _id: Types.ObjectId;
  email: string;
  userType: 'parent' | 'sitter' | 'tutor';
  otp: string;
  expiresAt: Date;
}
