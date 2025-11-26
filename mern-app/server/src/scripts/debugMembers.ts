import mongoose from 'mongoose';
import { Member } from '../models/Member';
import { Group } from '../models/Group';
import { config } from '../config/env';

const debugMembers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const members = await Member.find({}).populate('group', 'name').lean();
    console.log(`Found ${members.length} members.`);
    
    if (members.length > 0) {
      console.log('Sample Member:', JSON.stringify(members[0], null, 2));
    }

    const groups = await Group.find({}).lean();
    console.log(`Found ${groups.length} groups.`);
    if (groups.length > 0) {
      console.log('Sample Group:', JSON.stringify(groups[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
};

debugMembers();
