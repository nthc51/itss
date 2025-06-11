require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const express = require("express");
const cors = require("cors"); // CORS middleware
const bodyParser = require("body-parser"); // To parse JSON in request bodies
const bcrypt = require("bcryptjs"); // For hashing dummy user password

// Import models
const { User } = require("./models/models");

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// Enable CORS for requests from your React front-end on localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow cookies/auth headers if needed
  })
);

// Parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection URI
const DB_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/kitchen_app_db";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access your application at: http://localhost:${PORT}`);
    });

    // ********** Dummy user initialization (for testing) **********
    const createDummyUser = async () => {
      const dummyUsername = "testuser";
      const dummyEmail = "test@example.com";
      const dummyPassword = "testpassword";
      const dummyFullName = "Test User";
      const dummyRole = "HOMEMAKER";

      try {
        const existingUser = await User.findOne({
          $or: [{ username: dummyUsername }, { email: dummyEmail }],
        });
        if (!existingUser) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dummyPassword, salt);

          const newUser = new User({
            username: dummyUsername,
            password: hashedPassword,
            fullName: dummyFullName,
            email: dummyEmail,
            role: dummyRole,
          });
          await newUser.save();
          console.log('Dummy user "testuser" created with hashed password!');
        } else {
          console.log('Dummy user "testuser" already exists.');
        }
      } catch (err) {
        console.error("Error creating/checking dummy user:", err);
      }
    };
    createDummyUser();
    // ************************************************************
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import route modules
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const pantryItemRoutes = require("./routes/pantryItemRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const authRoutes = require("./routes/authRoutes"); // Auth routes (register, login)

// Mount routers under /api
app.use("/api/shoppinglists", shoppingListRoutes);
app.use("/api/pantryitems", pantryItemRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/auth", authRoutes); // e.g. POST /api/login, POST /api/register

module.exports = app;
