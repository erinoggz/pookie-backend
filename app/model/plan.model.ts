import { Schema, model } from 'mongoose';
import { IPlanModel } from './interface/IPlanModel';

// Create the plan schema
const PlanSchema = new Schema<IPlanModel>(
  {
    name: {
      type: String,
    },
    label: {
      type: String,
    },
    interval: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly',
    },
    amount: {
      type: Number,
    },
    plan_code: {
      type: String,
    },
    send_invoices: {
      type: Boolean,
    },
    currency: {
      type: String,
    },
    status: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export plan model
const Plan = model<IPlanModel>('Plan', PlanSchema);

export default Plan;
