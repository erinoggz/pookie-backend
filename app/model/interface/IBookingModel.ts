import { Document, Types } from 'mongoose';

export interface IBookingModel extends Document {
  _id: Types.ObjectId;
  merchant: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  actualStartDate: Date;
  actualEndDate: Date;
  customerRequest: 'accepted' | 'declined' | 'completed' | 'active';
  merchantRequest: 'accepted' | 'pending' | 'declined' | 'completed' | 'active';
  totalHours: number;
  address: string;
  bookingStatus:
    | 'accepted'
    | 'pending'
    | 'declined'
    | 'waiting'
    | 'active'
    | 'completed';
  customerRated: boolean;
  totalAmount: number;
  status: boolean;
}
