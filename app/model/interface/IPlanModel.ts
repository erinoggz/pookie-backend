import { Document, Types } from 'mongoose';

export interface IPlanModel extends Document {
  _id: Types.ObjectId;
  name: string;
  label: string;
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  plan_type: 'FREE' | 'STANDARD' | 'PREMIUM';
  unlimited_messages: boolean;
  video_call: boolean;
  access_to_verified_sitters: boolean;
  check_references: boolean;
  day_live_chat: boolean;
  emergency_sitter_support: boolean;
  monthly_rewards: boolean;
  booking_fee: boolean;
  userType: 'PARENT' | 'SITTER' | 'GRIND';
  amount: number;
  plan_code: string;
  send_invoices: boolean;
  paystack_id: string;
  currency: string;
  status: boolean;
}
