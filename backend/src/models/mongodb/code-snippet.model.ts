import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICodeSnippet extends Document {
    snippetId: string;
    reviewId: string;
    filePath: string;
    content: string;
    language: string;
    lineNumbers: {
        start: number;
        end: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CodeSnippetSchema: Schema = new Schema({
    snippetId: { type: String, required: true, unique: true, index: true },
    reviewId: {
        type: String,
        required: true,
        index: true,
    },
    filePath: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => v.length > 0 && v.length <= 500,
            message: 'filePath must be between 1 and 500 characters',
        }
    },
    content: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => v.length > 0 && v.length <= 100000,
            message: 'content must be between 1 and 100000 characters',
        }
    },
    language: {
        type: String,
        required: true,
        enum: [
            'javascript',
            'typescript',
            'python',
            'java',
            'cpp',
            'c',
            'csharp',
            'go',
            'rust',
            'php',
            'ruby',
            'swift',
            'kotlin',
            'dart',
            'html',
            'css',
            'json',
            'yaml',
            'xml',
            'sql',
            'shell',
            'other',
        ],
        index: true,
    },
    lineNumbers: {
        start: { type: Number, required: true, min: 1 },
        end: {
            type: Number, required: true, min: 1, validate: {
                validator: function (this: ICodeSnippet, v: number) {
                    return v >= this.lineNumbers.start;
                },
                message: 'end line number must be greater than or equal to start line number',
            }
        },

    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'code_snippets' });

CodeSnippetSchema.index({ reviewId: 1, filePath: 1 });
CodeSnippetSchema.index({ snippetId: 1 }, { unique: true });
CodeSnippetSchema.index({ language: 1, reviewId: 1 });

export const CodeSnippet: Model<ICodeSnippet> = mongoose.model<ICodeSnippet>('CodeSnippet', CodeSnippetSchema);
