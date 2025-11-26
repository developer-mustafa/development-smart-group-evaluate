import mongoose, { Schema } from 'mongoose';
import { ISettings } from '../types';

const settingsSchema = new Schema<ISettings>(
  {
    dashboardSections: {
      type: Map,
      of: Boolean,
      default: {},
    },
    sidebarTabs: {
      type: Map,
      of: {
        visible: Boolean,
        type: {
          type: String,
          enum: ['public', 'private'],
        },
      },
      default: {},
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
