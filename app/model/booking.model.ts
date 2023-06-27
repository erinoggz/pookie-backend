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
      enum: ['accepted', 'declined', 'completed', 'active'],
      default: 'accepted',
    },
    merchantRequest: {
      type: String,
      enum: ['accepted', 'pending', 'declined', 'completed', 'active'],
      default: 'pending',
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
      enum: ['accepted', 'pending', 'declined', 'waiting', 'active', 'completed'],
      default: 'pending',
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
