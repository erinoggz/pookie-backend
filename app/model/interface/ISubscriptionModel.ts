import { Document, Types } from 'mongoose';

export interface ISubscriptionModel extends Document {
  _id: Types.ObjectId;
  name: string;
  amount: number;
  transaction_reference: string;
  plan: Types.ObjectId;
  store: Types.ObjectId;
  user: Types.ObjectId;
  start_date: Date;
  expiry_date: Date;
  duration: number;
  currency: string;
  status: 'active' | 'inactive' | 'complete' | 'cancled';
}
