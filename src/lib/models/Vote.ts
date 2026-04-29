import mongoose, { Schema, Document, Model } from "mongoose";

export interface VoteDoc extends Document {
  issueId: mongoose.Types.ObjectId;
  voterFingerprint: string;
  createdAt: Date;
}

const VoteSchema = new Schema<VoteDoc>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    voterFingerprint: { type: String, required: true },
  },
  { timestamps: true }
);

VoteSchema.index({ issueId: 1, voterFingerprint: 1 }, { unique: true });

const VoteModel: Model<VoteDoc> =
  mongoose.models.Vote || mongoose.model<VoteDoc>("Vote", VoteSchema);

export default VoteModel;
