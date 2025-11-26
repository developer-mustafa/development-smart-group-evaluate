// Script to reset admin user with correct password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://smart-evaluate:EkjZjQvMT3pbM4Kn@cluster0.sirkvzw.mongodb.net/smart-group-evaluator?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['super-admin', 'admin', 'user'], default: 'user' },
  permissions: {
    read: { type: Boolean, default: true },
    write: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️  Deleted old admin user');

    // Hash password properly
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create new admin user
    const admin = await User.create({
      email: 'admin@test.com',
      password: hashedPassword,
      displayName: 'Super Admin',
      role: 'super-admin',
      permissions: {
        read: true,
        write: true,
        edit: true,
        delete: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User ID:', admin._id);
    console.log('🔐 Hashed Password:', hashedPassword.substring(0, 20) + '...');

    // Test password
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('✅ Password verification:', isMatch ? 'PASS' : 'FAIL');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
