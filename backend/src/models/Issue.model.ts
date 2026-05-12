import mongoose, { Schema } from 'mongoose';
import { IIssue } from '../types';
import { ISSUE_CATEGORIES, ISSUE_STATUS, URGENCY_LEVELS } from '../config/constants';

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ISSUE_CATEGORIES,
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (v: number[]) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: 'Invalid coordinates',
        },
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ISSUE_STATUS),
      default: ISSUE_STATUS.PENDING,
    },
    urgency: {
      type: String,
      enum: Object.values(URGENCY_LEVELS),
      default: URGENCY_LEVELS.MEDIUM,
    },
    votesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// GeoSpatial Index - CRITICAL for location queries
IssueSchema.index({ location: '2dsphere' });

// Performance Indexes
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ urgency: 1 });
IssueSchema.index({ priorityScore: -1 });
IssueSchema.index({ votesCount: -1 });
IssueSchema.index({ createdBy: 1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ status: 1, priorityScore: -1 });
IssueSchema.index({ category: 1, status: 1 });

// Text Search Index
IssueSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for days unresolved
IssueSchema.virtual('unresolvedDays').get(function () {
  if (this.status === 'resolved' && this.resolvedAt) {
    const ms = this.resolvedAt.getTime() - this.createdAt.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }
  const ms = Date.now() - this.createdAt.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
});

const Issue = mongoose.model<IIssue>('Issue', IssueSchema);
export default Issue;