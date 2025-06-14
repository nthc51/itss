// app.js

require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors"); // CORS middleware for cross-origin requests
const bodyParser = require("body-parser"); // To parse JSON bodies from requests
const bcrypt = require("bcryptjs"); // For hashing dummy user password

// Import the database connection function
const connectDB = require("./config/db");

// Import models
// Note: We only specifically import User here for dummy user creation.
// Other models will be implicitly used by their respective controllers.
const { User } = require("./models/models");

const app = express();
const PORT = process.env.PORT || 3001; // Server port, default to 3001

// Custom logging middleware
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// Enable CORS for requests from your React front-end (e.g., on localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    credentials: true, // Allow sending cookies/authorization headers
  })
);

// Parse JSON bodies from incoming requests
app.use(bodyParser.json());

// ********** START DATABASE CONNECTION AND SERVER **********
// Connect to MongoDB first, then start the server
connectDB()
  .then(() => {
    // If database connection is successful, start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access your application at: http://localhost:${PORT}`);
    });

    // ********** Dummy user initialization (for testing purposes) **********
    // This function creates a default user if one doesn't already exist.
    const createDummyUser = async () => {
      const dummyUsername = "testuser";
      const dummyEmail = "test@example.com";
      const dummyPassword = "testpassword";
      const dummyFullName = "Test User";
      const dummyRole = "HOMEMAKER"; // Or "ADMIN", "USER" as per your roles

      try {
        // Check if a user with the dummy username or email already exists
        const existingUser = await User.findOne({
          $or: [{ username: dummyUsername }, { email: dummyEmail }],
        });

        if (!existingUser) {
          // If the dummy user does not exist, create it
          const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
          const hashedPassword = await bcrypt.hash(dummyPassword, salt); // Hash the password

          const newUser = new User({
            username: dummyUsername,
            password: hashedPassword,
            fullName: dummyFullName,
            email: dummyEmail,
            role: dummyRole,
          });
          await newUser.save(); // Save the new user to the database
          console.log('Dummy user "testuser" created with hashed password!');
        } else {
          console.log('Dummy user "testuser" already exists.');
        }
      } catch (err) {
        console.error("Error creating/checking dummy user:", err);
      }
    };
    createDummyUser(); // Call the dummy user creation function
    // ************************************************************
  })
  .catch((err) => {
    // If database connection fails, log the error and exit the application
    console.error("Failed to connect to MongoDB and start server:", err);
    process.exit(1);
  });
// ***************************************************************

// Import route modules
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const pantryItemRoutes = require("./routes/pantryItemRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const authRoutes = require("./routes/authRoutes");
const foodCategoryRoutes = require("./routes/foodCategoryRoutes"); // New import
const unitRoutes = require("./routes/unitRoutes");                 // New import
//const categoryRoutes = require("./routes/caRoutes");

// Mount routers under specific API paths
// These paths define the base URL for each set of routes
app.use("/api/shopping-lists", shoppingListRoutes);
app.use("/api/pantry-items", pantryItemRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/auth", authRoutes); // Handles user registration, login, etc.
app.use("/api/food-categories", foodCategoryRoutes); // New mount
app.use("/api/units", unitRoutes);                     // New mount

// Export the app module for testing or other uses
module.exports = app;