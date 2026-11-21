const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel"); // Sigurohu që path-i të jetë i saktë
require('dotenv').config();

const salt = bcrypt.genSaltSync(10); // Rregulluar nga getSaltSync në genSaltSync

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const adminEmail = "admin@house.com";
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log("This admin already exists");
            await mongoose.disconnect();
            return;
        }

        const admin = new User({
            username: "admin",
            email: "admin@house.com",
            password: bcrypt.hashSync("admin10", salt),
            role: "admin",
        });

        await admin.save();
        console.log("Admin was created: ", admin.email);
        await mongoose.disconnect();
    } catch (err) {
        console.log("Admin was not created. " + err);
        process.exit(1);
    }
};

createAdmin();