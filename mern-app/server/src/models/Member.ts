import mongoose, { Schema } from 'mongoose';
import { IMember } from '../types';

const memberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    roll: {
      type: String,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['ছেলে', 'মেয়ে', ''],
      default: '',
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
    contact: {
      type: String,
      trim: true,
    },
    academicGroup: {
      type: String,
      trim: true,
    },
    session: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['team-leader', 'time-keeper', 'reporter', 'resource-manager', 'peace-maker', ''],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
memberSchema.index({ name: 'text', roll: 'text' });

export const Member = mongoose.model<IMember>('Member', memberSchema);
