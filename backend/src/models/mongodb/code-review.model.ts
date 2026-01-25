import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICodeReview extends Document {
    reviewid: string;
    projectId: string;
    codeSnippet?: string;
    status: 'pending' | 'in_progress' | 'complete' | 'failed' | 'cancelled';
    aiAnalysis?: {
        summary?: string;
        suggestions?: Array<{
            type: 'error' | 'warning' | 'info' | 'suggestions';
            servrity: 'low' | 'medium' | 'high' | 'critical';
            message: string;
            lineNumber?: number;
            code?: string;
        }>;
        score?: number;
        metrics?: {
            complexity?: number;
            maintainability?: number;
            security?: number;
            performance?: number;
        };
        model?: string;
        tokensUsed?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CodeReviewSchema: Schema = new Schema({
    reviewid: { type: String, required: true, unique: true, index: true },
    projectId: {
        type: String,
        required: true,
        index: true,
        validate: {
            validator: (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v),
            message: 'projectId must be a valid UUID',
        }
    },
    codeSnippet: { type: String, required: false },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in_progress', 'complete', 'failed', 'cancelled'],
        default: 'pending',
        index: true,
    },
    aiAnalysis: {
        summary: { type: String, required: false },
        suggestions: [
            {
                type: {
                    type: String,
                    enum: ['error', 'warning', 'info', 'suggestions'],
                    required: true,
                },
                servrity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical'],
                    required: true,
                },
                message: {
                    type: String,
                    required: true,
                },
                lineNumber: { type: Number, required: false, min: 1 },
                code: { type: String, required: false },
            }
        ],
        score: { type: Number, required: false, min: 0, max: 100 },
        metrics: {
            complexity: { type: Number, required: false, min: 0 },
            maintainability: { type: Number, required: false, min: 0, max: 100 },
            security: { type: Number, required: false, min: 0, max: 100 },
            performance: { type: Number, required: false, min: 0, max: 100 },
        },
        model: { type: String, required: false },
        tokensUsed: { type: Number, required: false, min: 0 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'code_reviews' });

CodeReviewSchema.index({ projectId: 1, status: 1 });
CodeReviewSchema.index({ createdAt: -1 });
CodeReviewSchema.index({ 'aiAnalysis.score': -1 });
CodeReviewSchema.index({ reviewid: 1 }, { unique: true });

export const CodeReview: Model<ICodeReview> = mongoose.model<ICodeReview>('CodeReview', CodeReviewSchema);
