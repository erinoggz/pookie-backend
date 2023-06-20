import { model, Schema } from 'mongoose';
import { IRatings } from './interface/IRatings';

// Create the ratings schema
const RatingsSchema = new Schema<IRatings>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    comment: String,
    ratingScore: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export ratings model
const Ratings = model<IRatings>('Ratings', RatingsSchema);

export default Ratings;
