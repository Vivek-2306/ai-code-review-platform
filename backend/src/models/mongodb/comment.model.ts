import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    commentId: string;
    reviewId: string; // References code_reviews.reviewId
    snippetId?: string; // References code_snippets.snippetId (optional for general comments)
    userId: string; // References PostgreSQL users.id
    content: string;
    lineNumber?: number; // Optional line-specific comment
    type: 'review' | 'suggestion' | 'question' | 'approval' | 'rejection' | 'general';
    parentCommentId?: string; // For threaded comments
    isResolved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        commentId: {
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
        snippetId: {
            type: String,
            required: false,
            index: true,
            ref: 'CodeSnippet',
        },
        userId: {
            type: String,
            required: true,
            index: true,
            validate: {
                validator: (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
                message: 'userId must be a valid UUID',
            },
        },
        content: {
            type: String,
            required: true,
            validate: {
                validator: (v: string) => v.trim().length > 0 && v.length <= 5000,
                message: 'content must be between 1 and 5000 characters',
            },
        },
        lineNumber: {
            type: Number,
            required: false,
            min: 1,
        },
        type: {
            type: String,
            enum: ['review', 'suggestion', 'question', 'approval', 'rejection', 'general'],
            default: 'general',
            required: true,
            index: true,
        },
        parentCommentId: {
            type: String,
            required: false,
            index: true,
            ref: 'Comment',
        },
        isResolved: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'comments',
    }
);

// Indexes
CommentSchema.index({ reviewId: 1, snippetId: 1 });
CommentSchema.index({ reviewId: 1, userId: 1 });
CommentSchema.index({ commentId: 1 }, { unique: true });
CommentSchema.index({ parentCommentId: 1 });
CommentSchema.index({ isResolved: 1, reviewId: 1 });

export const Comment: Model<IComment> = mongoose.model<IComment>(
    'Comment',
    CommentSchema
);