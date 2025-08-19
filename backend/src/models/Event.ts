import { Schema, model, Document, Model } from 'mongoose';
import { Event as IEvent } from '@shared/types';

// Extend the shared Event interface with Mongoose Document
interface IEventDocument extends IEvent, Document {}

const eventSchema = new Schema<IEventDocument>(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    maxParticipants: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
eventSchema.index({ organizerId: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });

// Virtual for checking if event is active
eventSchema.virtual('isActive').get(function (this: IEventDocument) {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Create and export the model
const Event: Model<IEventDocument> = model<IEventDocument>('Event', eventSchema);

export default Event;
