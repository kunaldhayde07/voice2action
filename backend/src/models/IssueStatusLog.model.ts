import mongoose, { Schema } from 'mongoose';
import { IIssueStatusLog } from '../types';
import { ISSUE_STATUS } from '../config/constants';

const IssueStatusLogSchema = new Schema<IIssueStatusLog>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    previousStatus: {
      type: String,
      enum: Object.values(ISSUE_STATUS),
      required: true,
    },
    newStatus: {
      type: String,
      enum: Object.values(ISSUE_STATUS),
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

IssueStatusLogSchema.index({ issue: 1, createdAt: -1 });
IssueStatusLogSchema.index({ changedBy: 1 });

const IssueStatusLog = mongoose.model<IIssueStatusLog>('IssueStatusLog', IssueStatusLogSchema);
export default IssueStatusLog;