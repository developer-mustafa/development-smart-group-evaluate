import mongoose, { Schema } from 'mongoose';
import { IEvaluation } from '../types';

const evaluationSchema = new Schema<IEvaluation>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task is required'],
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    scores: {
      type: Map,
      of: new Schema({
        taskScore: { type: Number, required: true, min: 0 },
        teamScore: { type: Number, required: true, min: 0 },
        mcqScore: { type: Number, required: true, min: 0 },
        additionalScore: { type: Number, required: true },
        totalScore: { type: Number, required: true, min: 0 },
        additionalCriteria: {
          topic: { type: String, default: '' },
          homework: { type: Boolean, default: false },
          attendance: { type: Boolean, default: false },
        },
        comments: { type: String, trim: true },
      }, { _id: false }),
      required: true,
    },
    studentCount: {
      type: Number,
      required: true,
      min: 0,
    },
    groupTotalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    groupAverageScore: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPossibleScore: {
      type: Number,
      required: true,
      min: 0,
    },
    evaluatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
evaluationSchema.index({ task: 1, group: 1 }, { unique: true }); // One evaluation per task-group
evaluationSchema.index({ group: 1, task: 1 });

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
