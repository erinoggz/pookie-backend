import { Schema, model } from 'mongoose';
import { IBookingModel } from './interface/IBookingModel';

// Create the booking schema
const BookingSchema = new Schema<IBookingModel>(
  {
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    actualStartDate: {
      type: Date,
    },
    actualEndDate: {
      type: Date,
    },
    customerRequest: {
      type: String,
      enum: ['ACCEPTED', 'DECLINED', 'COMPLETED', 'ACTIVE'],
      default: 'ACCEPTED',
    },
    merchantRequest: {
      type: String,
      enum: ['ACCEPTED', 'PENDING', 'DECLINED', 'COMPLETED', 'ACTIVE'],
      default: 'PENDING',
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
    },
    bookingStatus: {
      type: String,
      enum: ['ACCEPTED', 'PENDING', 'DECLINED', 'WAITING', 'ACTIVE', 'COMPLETED'],
      default: 'PENDING',
    },
    customerRated: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export booking model
const Booking = model<IBookingModel>('Booking', BookingSchema);

export default Booking;
