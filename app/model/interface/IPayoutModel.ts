import { Document, Types } from 'mongoose';

export interface IPayoutModel extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  batchId: string;
  reference: string;
  email: string;
  batchStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'FAILED'
    | 'BLOCKED'
    | 'CANCELED';
  resolved: boolean;
  resolvedAt: Date;
  wallet: string;
}
