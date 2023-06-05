import { Document, Types } from 'mongoose';

export interface IBookingModel extends Document {
  _id: Types.ObjectId;
  merchant: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  customerRequest: 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'ACTIVE';
  merchantRequest: 'ACCEPTED' | 'PENDING' | 'DECLINED' | 'COMPLETED' | 'ACTIVE';
  totalHours: number;
  address: string;
  bookingStatus: 'ACCEPTED' | 'PENDING' | 'DECLINED' | 'ACTIVE' | 'COMPLETED';
  customerRated: boolean;
  totalAmount: number;
  status: boolean;
}
