const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        const admin = await User.findOne({ username: 'admin' });
        console.log(`Total users: ${count}`);
        console.log(`Admin user found: ${admin ? 'Yes' : 'No'}`);
        if (admin) {
            console.log(`Admin role: ${admin.role}`);
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
