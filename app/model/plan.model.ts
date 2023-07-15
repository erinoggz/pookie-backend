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
    plan_type: {
      type: String,
      enum: ['free', 'standard', 'premium'],
      default: 'free',
    },
    unlimited_messages: {
      type: Boolean,
      default: false,
    },
    video_call: {
      type: Boolean,
      default: false,
    },
    access_to_verified_sitters: {
      type: Boolean,
      default: false,
    },
    check_references: {
      type: Boolean,
      default: false,
    },
    day_live_chat: {
      type: Boolean,
      default: false,
    },
    emergency_sitter_support: {
      type: Boolean,
      default: false,
    },
    monthly_rewards: {
      type: Boolean,
      default: false,
    },
    booking_fee: {
      type: Boolean,
      default: true,
    },
    userType: {
      type: String,
      enum: Object.values(['parent', 'sitter', 'tutor']).concat([null]),
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
