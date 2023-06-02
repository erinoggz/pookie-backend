import { model, Schema } from 'mongoose';
import { ISubscriptionModel } from './interface/ISubscriptionModel';

// Create the subscriptionlan schema
const SubscriptionSchema = new Schema<ISubscriptionModel>(
  {
    name: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    transaction_reference: {
      type: String,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
    },
    amount: {
      type: Number,
    },
    start_date: {
      type: Date,
    },
    expiry_date: {
      type: Date,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'COMPLETE', 'CANCLED'],
      default: 'INACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Create and export subscription model
const Subscription = model<ISubscriptionModel>('Subscription', SubscriptionSchema);

export default Subscription;
