import { Schema, model } from 'mongoose';
import { ITransactionHistory } from './interface/ITransactionHistory';

// Create the transaction-history schema
const TransactionHistorySchema = new Schema<ITransactionHistory>(
  {
    transactionId: String,
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    transactionType: {
      type: String,
      enum: Object.values(['apple', 'stripe']).concat([null]),
    },
  },
  {
    timestamps: true,
  }
);

// Create and export transaction-history model
const TransactionHistory = model<ITransactionHistory>(
  'TransactionHistory',
  TransactionHistorySchema
);

export default TransactionHistory;
