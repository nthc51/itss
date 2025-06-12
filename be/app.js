// server.js
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors'); // Make sure to 'npm install colors'
const connectDB = require('./config/db');
const cors = require('cors'); // Make sure to 'npm install cors'

// Load environment variables from .env file
dotenv.config({ path: './config/config.env' }); // Assuming .env is in be/config/

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Middleware: Body parser to read JSON from request body
app.use(express.json());

// Middleware: Enable CORS (allows frontend from different domains to access backend)
app.use(cors());

// Import route files for each resource
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const foodCategoryRoutes = require('./routes/foodCategoryRoutes');
const unitRoutes = require('./routes/unitRoutes');
const familyGroupRoutes = require('./routes/familyGroupRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const pantryItemRoutes = require('./routes/pantryItemRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const weeklyPlanRoutes = require('./routes/weeklyPlanRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

// Mount routes to the application with API prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food-categories', foodCategoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/family-groups', familyGroupRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/pantry-items', pantryItemRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/weekly-plans', weeklyPlanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Middleware for handling 404 Not Found routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Global error handling middleware
// Catches errors from async functions in controllers and other errors
app.use((err, req, res, next) => {
  console.error(err.stack.red);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    // stack: process.env.NODE_ENV === 'development' ? err.stack : {} // Show stack only in development mode
  });
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);
