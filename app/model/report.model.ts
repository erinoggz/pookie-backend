import { model, Schema } from 'mongoose';
import { IReportModel } from './interface/IReportModel';

// Create the report schema
const ReportSchema = new Schema<IReportModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    reporting_user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    comment: {
      type: String,
    },
    evidence: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export report model
const Report = model<IReportModel>('Report', ReportSchema);

export default Report;
