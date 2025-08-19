import { Schema, model, Document, Model } from 'mongoose';
import { Score as IScore } from '@shared/types';

// Extend the shared Score interface with Mongoose Document
export interface IScoreDocument extends IScore, Document {}

const scoreSchema = new Schema<IScoreDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    judgeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    criteriaId: {
      type: Schema.Types.ObjectId,
      ref: 'JudgingCriteria',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Add a compound unique index to ensure one score per judge per criteria per project
scoreSchema.index(
  { projectId: 1, judgeId: 1, criteriaId: 1 },
  { unique: true }
);

// Create and export the model
const Score: Model<IScoreDocument> = model<IScoreDocument>('Score', scoreSchema);

export default Score;
