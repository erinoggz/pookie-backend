import { Types } from 'mongoose';

export interface IRatings extends Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  merchant: Types.ObjectId;
  booking: Types.ObjectId;
  comment: string;
  resolved: boolean;
  ratingScore: 1 | 2 | 3 | 4 | 5;
}
