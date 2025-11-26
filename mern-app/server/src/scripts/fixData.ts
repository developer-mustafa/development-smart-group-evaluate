import mongoose from 'mongoose';
import { Member } from '../models/Member';
import { Group } from '../models/Group';
import { config } from '../config/env';

const fixData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const members = await Member.find({});
    const groups = await Group.find({});

    if (groups.length === 0) {
      console.log('No groups found. Creating default groups...');
      const newGroups = ['Padma', 'Meghna', 'Jamuna', 'Karnaphuli'];
      for (const name of newGroups) {
        await Group.create({ name, createdBy: members[0]?.createdBy || new mongoose.Types.ObjectId() });
      }
    }

    const allGroups = await Group.find({});
    console.log(`Found ${members.length} members and ${allGroups.length} groups.`);

    // Distribute members to groups
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const group = allGroups[i % allGroups.length]; // Round robin assignment

      console.log(`Assigning ${member.name} to ${group.name}`);

      // Update Member
      member.group = group._id;
      await member.save();

      // Update Group
      await Group.findByIdAndUpdate(group._id, {
        $addToSet: { members: member._id }
      });
    }

    console.log('Data fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
};

fixData();
