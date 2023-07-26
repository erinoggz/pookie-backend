import { Schema, model } from 'mongoose';
import { IWalletHistory } from './interface/IWallet';

// Create the wallet-history schema
const WalletHistorySchema = new Schema<IWalletHistory>(
  {
    walletId: String,
    referenceNo: String,
    amount: Number,
    charges: Number,
    amountSettled: Number,
    description: String,
    previousBalance: Number,
    newBalance: Number,
    type: {
      type: String,
      enum: ['debit', 'credit'],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
  },
  {
    timestamps: true,
  }
);

// Create and export wallet-history model
const WalletHistory = model<IWalletHistory>('WalletHistory', WalletHistorySchema);

export default WalletHistory;
