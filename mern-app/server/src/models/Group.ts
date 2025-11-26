import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types';

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);
