import { Document, Model, Schema, model } from 'mongoose';

// Define the base schema options
const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

// Base schema with common fields
export class BaseModel<T extends Document> extends Model<T> {
  constructor(schemaDefinition: any) {
    const schema = new Schema(schemaDefinition, schemaOptions);
    
    // Add common middleware here
    schema.pre('save', function (next) {
      next();
    });

    return model<T>(this.constructor.name, schema);
  }
}

// Helper function to create models
export function createModel<T extends Document>(
  name: string,
  schemaDefinition: any
): Model<T> {
  const schema = new Schema(schemaDefinition, schemaOptions);
  return model<T>(name, schema);
}
