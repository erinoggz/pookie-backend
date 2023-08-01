import { Schema, model } from 'mongoose';
import { IWallet } from './interface/IWallet';

// Create the wallet schema
const WalletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    walletId: {
      type: String,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'active', //pending active
    },
    pnd: {
      type: Boolean,
      default: false,
    },
    pnc: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 0,
    },
    withDrawalSetting: Object,
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export wallet model
const Wallet = model<IWallet>('Wallet', WalletSchema);

export default Wallet;
