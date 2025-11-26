import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: 0,
    },
    maxScoreBreakdown: {
      task: {
        type: Number,
        required: true,
        min: 0,
      },
      team: {
        type: Number,
        required: true,
        min: 0,
      },
      additional: {
        type: Number,
        required: true,
        min: 0,
      },
      mcq: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
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

export const Task = mongoose.model<ITask>('Task', taskSchema);
