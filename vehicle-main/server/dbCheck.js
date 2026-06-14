const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connection URI provided by the user
const uri = "mongodb+srv://tabraizsmd_db_user:M3EcmHNdVHln8Utf@cluster0.31mtvlo.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

// Define a minimal User Schema for diagnostics
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: { type: String, select: true },
  role: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');

    // 1. Check database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📂 Connected to database: "${dbName}"`);

    // 2. Count collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found collections:`, collections.map(c => c.name));

    // 3. Find admin user
    const adminUser = await User.findOne({ email: 'admin@kmc.gov.in' });
    if (!adminUser) {
      console.log('❌ Admin user "admin@kmc.gov.in" NOT found in this database!');
      
      // Seed admin user immediately if not present
      console.log('🌱 Creating admin user...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        username: 'KMC Admin',
        email: 'admin@kmc.gov.in',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created successfully with password: "admin123"');
    } else {
      console.log('👤 Admin user found:', {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      });

      // Reset password just in case it got corrupted or double-hashed
      console.log('🔄 Resetting admin password to "admin123"...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Admin password reset successfully!');
    }

  } catch (error) {
    console.error('❌ Error during diagnostics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

run();
