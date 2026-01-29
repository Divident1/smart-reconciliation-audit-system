const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const userExists = await User.findOne({ username: 'admin' });

        if (userExists) {
            console.log('Admin user already exists');
            userExists.password = '123456';
            await userExists.save();
            console.log('Admin password reset to 123456');
        } else {
            await User.create({
                username: 'admin',
                password: '123456',
                role: 'Admin'
            });
            console.log('Admin user created');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
