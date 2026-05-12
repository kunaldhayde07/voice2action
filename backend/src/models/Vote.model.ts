import mongoose, { Schema } from 'mongoose';
import { IVote } from '../types';

const VoteSchema = new Schema<IVote>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: [true, 'Issue is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate votes - compound unique index
VoteSchema.index({ issue: 1, user: 1 }, { unique: true });
VoteSchema.index({ user: 1 });
VoteSchema.index({ issue: 1 });
VoteSchema.index({ createdAt: -1 });

const Vote = mongoose.model<IVote>('Vote', VoteSchema);
export default Vote;