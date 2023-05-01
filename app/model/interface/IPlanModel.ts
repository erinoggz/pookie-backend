import { Document, Types } from 'mongoose';

export interface IPlanModel extends Document {
  _id: Types.ObjectId;
  name: string;
  label: string;
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  amount: number;
  plan_code: string;
  send_invoices: boolean;
  paystack_id: string;
  currency: string;
  status: boolean;
}
