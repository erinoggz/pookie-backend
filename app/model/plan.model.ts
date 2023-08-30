import { Schema, model } from 'mongoose';
import { IPlanModel } from './interface/IPlanModel';

// Create the plan schema
const PlanSchema = new Schema<IPlanModel>(
  {
    name: {
      type: String,
    },
    search: {
      type: Boolean,
      default: true,
    },
    profile_creation_charge: {
      type: Boolean,
      default: false,
    },
    message_limit: {
      type: Boolean,
    },
    message_limit_count: {
      type: Number,
    },
    platform_fees: {
      type: Boolean,
    },
    platform_fees_amount: {
      type: Number,
    },
    book_sitter_job: {
      type: Boolean,
      default: true,
    },
    cancellation_charge: {
      type: Boolean,
    },
    plan_type: {
      type: String,
      enum: ['free', 'standard', 'premium'],
      default: 'free',
    },
    cancellation_hour: {
      type: Number,
    },
    cancellation_percentage: {
      type: Number,
    },

    booking_fee: {
      type: Boolean,
      default: false,
    },
    booking_fee_charge: {
      type: Number,
    },
    label: {
      type: String,
    },
    userType: {
      type: String,
      enum: Object.values(['parent', 'sitter', 'tutor']).concat([null]),
    },
    interval: {
      type: String,
      enum: [
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'annually',
        'none',
      ],
      default: 'monthly',
    },
    priority_bookings: {
      type: Boolean,
    },
    amount: {
      type: Number,
    },
    plan_code: {
      type: String,
    },
    currency: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export plan model
const Plan = model<IPlanModel>('Plan', PlanSchema);

export default Plan;
