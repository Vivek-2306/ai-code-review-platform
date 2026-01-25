import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewMetrics extends Document {
    metricsId: string;
    reviewId: string; // References code_reviews.reviewId
    projectId: string; // References PostgreSQL project.id
    userId?: string; // References PostgreSQL users.id (reviewer)

    // Code Quality Metrics
    quality: {
        overallScore: number; // 0-100
        complexity: number;
        maintainability: number;
        security: number;
        performance: number;
        testCoverage?: number;
        documentation?: number;
    };

    // Review Process Metrics
    process: {
        timeToReview: number; // in milliseconds
        timeToFirstComment?: number; // in milliseconds
        numberOfComments: number;
        numberOfSuggestions: number;
        numberOfApprovals: number;
        numberOfRejections: number;
    };

    // AI Analysis Metrics
    aiAnalysis: {
        modelUsed: string;
        tokensUsed: number;
        cost?: number; // in USD
        responseTime: number; // in milliseconds
        confidence?: number; // 0-100
    };

    // Code Statistics
    codeStats: {
        linesOfCode: number;
        filesReviewed: number;
        languages: string[];
        averageFileSize: number; // in bytes
        largestFileSize: number; // in bytes
    };

    // Timestamps
    calculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewMetricsSchema: Schema = new Schema(
    {
        metricsId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        reviewId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            ref: 'CodeReview',
        },
        projectId: {
            type: String,
            required: true,
            index: true,
            validate: {
                validator: (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
                message: 'projectId must be a valid UUID',
            },
        },
        userId: {
            type: String,
            required: false,
            index: true,
            validate: {
                validator: (v: string) => !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
                message: 'userId must be a valid UUID',
            },
        },
        quality: {
            overallScore: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            complexity: {
                type: Number,
                required: true,
                min: 0,
            },
            maintainability: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            security: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            performance: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
            testCoverage: {
                type: Number,
                required: false,
                min: 0,
                max: 100,
            },
            documentation: {
                type: Number,
                required: false,
                min: 0,
                max: 100,
            },
        },
        process: {
            timeToReview: {
                type: Number,
                required: true,
                min: 0,
            },
            timeToFirstComment: {
                type: Number,
                required: false,
                min: 0,
            },
            numberOfComments: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
            numberOfSuggestions: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
            numberOfApprovals: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
            numberOfRejections: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
        },
        aiAnalysis: {
            modelUsed: {
                type: String,
                required: true,
            },
            tokensUsed: {
                type: Number,
                required: true,
                min: 0,
            },
            cost: {
                type: Number,
                required: false,
                min: 0,
            },
            responseTime: {
                type: Number,
                required: true,
                min: 0,
            },
            confidence: {
                type: Number,
                required: false,
                min: 0,
                max: 100,
            },
        },
        codeStats: {
            linesOfCode: {
                type: Number,
                required: true,
                min: 0,
            },
            filesReviewed: {
                type: Number,
                required: true,
                min: 0,
            },
            languages: [
                {
                    type: String,
                    required: true,
                },
            ],
            averageFileSize: {
                type: Number,
                required: true,
                min: 0,
            },
            largestFileSize: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        calculatedAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'review_metrics',
    }
);

// Indexes for analytics queries
ReviewMetricsSchema.index({ projectId: 1, calculatedAt: -1 });
ReviewMetricsSchema.index({ userId: 1, calculatedAt: -1 });
ReviewMetricsSchema.index({ 'quality.overallScore': -1 });
ReviewMetricsSchema.index({ metricsId: 1 }, { unique: true });
ReviewMetricsSchema.index({ reviewId: 1 }, { unique: true });

export const ReviewMetrics: Model<IReviewMetrics> = mongoose.model<IReviewMetrics>(
    'ReviewMetrics',
    ReviewMetricsSchema
);