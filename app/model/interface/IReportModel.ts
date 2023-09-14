import { Document, Types } from 'mongoose';

export interface IReportModel extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reporting_user: Types.ObjectId;
  comment: string;
  evidence: string;
}
