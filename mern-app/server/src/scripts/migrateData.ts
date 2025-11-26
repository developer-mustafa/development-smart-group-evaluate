import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { Member } from '../models/Member';
import { User } from '../models/User';
import { config } from '../config/env';

const migrateData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users.`);


    // --- Migrate Tasks ---
    console.log('Migrating Tasks...');
    const tasks = await Task.find({}).lean();
    console.log(`Found ${tasks.length} tasks.`);
    if (tasks.length > 0) {
      console.log('Sample task:', JSON.stringify(tasks[0], null, 2));
    }
    let tasksUpdated = 0;

    for (const task of tasks) {
      const anyTask = task as any;
      const updates: any = {};
      const unsets: any = {};
      let needsUpdate = false;

      // Migrate totalMarks -> maxScore
      if (anyTask.totalMarks !== undefined && anyTask.maxScore === undefined) {
        updates.maxScore = anyTask.totalMarks;
        unsets.totalMarks = 1;
        needsUpdate = true;
      }

      // Migrate breakdown -> maxScoreBreakdown
      if (anyTask.breakdown !== undefined && anyTask.maxScoreBreakdown === undefined) {
        updates.maxScoreBreakdown = anyTask.breakdown;
        unsets.breakdown = 1;
        needsUpdate = true;
      }

      // Set default status
      if (!anyTask.status) {
        updates.status = 'upcoming';
        needsUpdate = true;
      }

      // Set default scheduledTime
      if (anyTask.scheduledTime === undefined) {
        updates.scheduledTime = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Task.updateOne(
          { _id: task._id },
          { $set: updates, $unset: unsets }
        );
        tasksUpdated++;
      }
    }
    console.log(`Tasks updated: ${tasksUpdated}`);

    // --- Migrate Members ---
    console.log('Migrating Members...');
    const members = await Member.find({}).lean();
    let membersUpdated = 0;

    for (const member of members) {
      const anyMember = member as any;
      const updates: any = {};
      let needsUpdate = false;

      // Set default roll if missing
      if (!anyMember.roll) {
        updates.roll = `TEMP-${Math.floor(Math.random() * 10000)}`;
        needsUpdate = true;
      }

      // Set default gender
      if (!anyMember.gender) {
        updates.gender = '';
        needsUpdate = true;
      }

      // Set default role
      if (anyMember.role === undefined) {
        updates.role = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Member.updateOne(
          { _id: member._id },
          { $set: updates }
        );
        membersUpdated++;
      }
    }
    console.log(`Members updated: ${membersUpdated}`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateData();
