import { Schema, model, Document, Model } from 'mongoose';
import { User as IUser } from '@shared/types';

// Extend the shared User interface with Mongoose Document
export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  password?: string;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['participant', 'organizer', 'judge', 'admin'],
      default: 'participant',
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
userSchema.index({ email: 1 }, { unique: true });

// Create and export the model
const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);

export default User;
