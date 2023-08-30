import { Document, Types } from 'mongoose';

export interface IPlanModel extends Document {
  _id: Types.ObjectId;

  name: string;
  search: boolean;
  message_limit: boolean;
  message_limit_count: number;
  profile_creation_charge: boolean;
  platform_fees: boolean;
  book_sitter_job: boolean;
  booking_fee: boolean;
  platform_fees_amount: number;
  plan_type: 'free' | 'standard' | 'premium';
  cancellation_charge: boolean;
  cancellation_hour: number;
  cancellation_percentage: number;
  view_references: boolean;
  booking_fee_charge: number;
  label: string;
  interval:
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually'
    | 'none';
  amount: number;
  priority_bookings: boolean;
  plan_code: string;
  currency: string;
  userType: 'parent' | 'sitter' | 'tutor';
  status: boolean;
}
