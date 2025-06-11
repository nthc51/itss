// app.js - file chinh cua ung dung express
require('dotenv').config(); // de tai cac bien moi truong tu file .env
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const express = require('express'); // import express
const bodyParser = require('body-parser'); // import body-parser de xu ly json trong request body

// import cac models (neu cac router khong import rieng)
// trong truong hop nay, vi cac router deu import models, app.js chi can cac model cho dummy user
const { User } = require('./models/models');

const app = express(); // khoi tao ung dung express
const PORT = 3001; // dinh nghia cong cho server

// middleware: su dung body-parser de phan tich request body dang json
app.use(bodyParser.json());
// ket noi mongodb
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access your application at: http://localhost:${PORT}`);
    });

    // ********** logic khoi tao du lieu gia (co the xoa/chinh sua sau khi test) **********
    const newUser = new User({
      username: 'testuser',
      password: 'testpassword',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'HOMEMAKER',
    });

    newUser.save()
      .then(() => console.log('Dummy user created or already exists!'))
      .catch(err => {
        if (err.code === 11000) {
          console.log('Dummy user already exists (username or email duplicate).');
        } else {
          console.error('Error creating dummy user:', err);
        }
      });

  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// su dung cac router
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const pantryItemRoutes = require('./routes/pantryItemRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');

// Mount cac router vao cac duong dan co so tuong ung
app.use('/api/shoppinglists', shoppingListRoutes);
app.use('/api/pantryitems', pantryItemRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/mealplans', mealPlanRoutes); // Bao gom ca /api/mealplans/suggestions

// xuat app
module.exports = app;