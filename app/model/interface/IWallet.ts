import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  walletId: string;
  balance: number;
  status: 'active' | 'pending';
  pnd: boolean;
  pnc: boolean;
  limit: number;
  withDrawalSetting: IWithDrawalSetting;
  isDisabled: boolean;
}

export interface IWalletHistory extends Document {
  _id: Types.ObjectId;
  walletId: string;
  referenceNo: string;
  amount: number;
  charges: number;
  amountSettled: number;
  description: string;
  previousBalance: number;
  newBalance: number;
  type: 'debit' | 'credit';
  booking: Types.ObjectId;
}

export interface IWithDrawalSetting {
  min: number;
  max: number;
}
