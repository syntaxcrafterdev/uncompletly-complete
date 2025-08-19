import { Schema, model, Document, Model } from 'mongoose';
import { Project as IProject } from '@shared/types';

// Extend the shared Project interface with Mongoose Document
interface IProjectDocument extends IProject, Document {}

const projectSchema = new Schema<IProjectDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    repoUrl: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected'],
      default: 'draft',
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
projectSchema.index({ eventId: 1 });
projectSchema.index({ teamId: 1 });
projectSchema.index({ status: 1 });

// Create and export the model
const Project: Model<IProjectDocument> = model<IProjectDocument>('Project', projectSchema);

export default Project;
