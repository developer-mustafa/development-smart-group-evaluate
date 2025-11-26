import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  role: 'super-admin' | 'admin' | 'user';
  permissions: {
    read: boolean;
    write: boolean;
    edit: boolean;
    delete: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  members: string[]; // Member IDs
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IMember extends Document {
  name: string;
  roll: string;
  gender: string;
  group?: string; // Group ID
  contact?: string;
  academicGroup: string;
  session: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  name: string;
  description?: string;
  dueDate?: Date;
  scheduledTime?: string;
  maxScore: number;
  maxScoreBreakdown: {
    task: number;
    team: number;
    additional: number;
    mcq: number;
  };
  status: 'upcoming' | 'ongoing' | 'completed';
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvaluation extends Document {
  task: string; // Task ID
  group: string; // Group ID
  scores: {
    [studentId: string]: {
      taskScore: number;
      teamScore: number;
      mcqScore: number;
      additionalScore: number;
      totalScore: number;
      additionalCriteria: {
        topic: string;
        homework: boolean;
        attendance: boolean;
      };
      comments?: string;
    };
  };
  studentCount: number;
  groupTotalScore: number;
  groupAverageScore: number;
  maxPossibleScore: number;
  evaluatedBy: string; // User ID
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettings extends Document {
  dashboardSections: {
    [key: string]: boolean;
  };
  sidebarTabs: {
    [key: string]: {
      visible: boolean;
      type: 'public' | 'private';
    };
  };
  theme?: 'light' | 'dark';
  updatedBy: string; // User ID
  updatedAt: Date;
}
