// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kitchen_app_db";
        mongoose.set("strictQuery", true); // Để loại bỏ cảnh báo DeprecationWarning

        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;