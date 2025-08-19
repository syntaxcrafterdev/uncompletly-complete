import { Schema, model, Document, Model, Types } from 'mongoose';
import { Team as ITeam } from '@shared/types';

// Extend the shared Team interface with Mongoose Document
export interface ITeamDocument extends ITeam, Document {
  _id: Types.ObjectId;
}

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
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
teamSchema.index({ eventId: 1 });
teamSchema.index({ 'members.userId': 1 });

// Create and export the model
const Team: Model<ITeamDocument> = model<ITeamDocument>('Team', teamSchema);

export default Team;
