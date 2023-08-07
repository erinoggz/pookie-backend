import { Schema, model } from 'mongoose';
import { IPayoutModel } from './interface/IPayoutModel';

// Create the payout schema
const PayoutSchema = new Schema<IPayoutModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    reference: {
      type: String,
    },
    batchId: {
      type: String,
    },
    wallet: {
      type: String,
    },
    amount: {
      type: Number,
    },
    batchStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'DENIED', 'CANCELED'],
      default: 'PENDING',
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export payout model
const Payout = model<IPayoutModel>('Payout', PayoutSchema);

export default Payout;
