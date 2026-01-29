const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Completely delete and recreate to ensure no hook interference or weird states
        await User.deleteMany({ username: 'admin' });

        const hashedPassword = await bcrypt.hash('123456', 10);

        // Use direct insert to avoid any pre-save hooks if they are causing double hashing
        await mongoose.connection.collection('users').insertOne({
            username: 'admin',
            password: hashedPassword,
            role: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Admin user recreated with raw insert (Bulletproof)!');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
