import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewHistory extends Document {
    historyId: string;
    reviewId: string; // References code_reviews.reviewId
    action: 'created' | 'updated' | 'status_changed' | 'analysis_started' | 'analysis_completed' | 'comment_added' | 'resolved' | 'reopened';
    performedBy: string; // userId or 'system'
    changes?: {
        field: string;
        oldValue?: any;
        newValue?: any;
    }[];
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        duration?: number; // in milliseconds
        [key: string]: any;
    };
    createdAt: Date;
}

const ReviewHistorySchema: Schema = new Schema(
    {
        historyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        reviewId: {
            type: String,
            required: true,
            index: true,
            ref: 'CodeReview',
        },
        action: {
            type: String,
            enum: [
                'created',
                'updated',
                'status_changed',
                'analysis_started',
                'analysis_completed',
                'comment_added',
                'resolved',
                'reopened',
            ],
            required: true,
            index: true,
        },
        performedBy: {
            type: String,
            required: true,
            index: true,
        },
        changes: [
            {
                field: {
                    type: String,
                    required: true,
                },
                oldValue: {
                    type: Schema.Types.Mixed,
                    required: false,
                },
                newValue: {
                    type: Schema.Types.Mixed,
                    required: false,
                },
            },
        ],
        metadata: {
            type: Schema.Types.Mixed,
            required: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
        collection: 'review_history',
    }
);

// Indexes for audit trail queries
ReviewHistorySchema.index({ reviewId: 1, createdAt: -1 });
ReviewHistorySchema.index({ performedBy: 1, createdAt: -1 });
ReviewHistorySchema.index({ action: 1, createdAt: -1 });
ReviewHistorySchema.index({ historyId: 1 }, { unique: true });

// TTL index to auto-delete old history after 2 years (optional)
ReviewHistorySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 63072000 } // 2 years in seconds
);

export const ReviewHistory: Model<IReviewHistory> = mongoose.model<IReviewHistory>(
    'ReviewHistory',
    ReviewHistorySchema
);