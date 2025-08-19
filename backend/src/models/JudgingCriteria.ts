import { Schema, model, Document, Model } from 'mongoose';
import { JudgingCriteria as IJudgingCriteria } from '@shared/types';

// Extend the shared JudgingCriteria interface with Mongoose Document
interface IJudgingCriteriaDocument extends IJudgingCriteria, Document {}

const judgingCriteriaSchema = new Schema<IJudgingCriteriaDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 1,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
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

// Add indexes
judgingCriteriaSchema.index({ eventId: 1 });

// Create and export the model
const JudgingCriteria: Model<IJudgingCriteriaDocument> = model<IJudgingCriteriaDocument>(
  'JudgingCriteria',
  judgingCriteriaSchema
);

export default JudgingCriteria;
