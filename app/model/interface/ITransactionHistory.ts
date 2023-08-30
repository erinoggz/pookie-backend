import { Types } from 'mongoose';

export interface ITransactionHistory extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId;
  transactionId: string;
}
