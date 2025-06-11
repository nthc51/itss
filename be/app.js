// app.js - file chinh cua ung dung express
require('dotenv').config(); // de tai cac bien moi truong tu file .env
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const express = require('express'); // import express
const bodyParser = require('body-parser'); // import body-parser de xu ly json trong request body
const bcrypt = require('bcryptjs'); // Import bcryptjs để mã hóa mật khẩu cho dummy user

// import cac models (neu cac router khong import rieng)
// trong truong hop nay, vi cac router deu import models, app.js chi can cac model cho dummy user
const { User } = require('./models/models');

const app = express(); // khoi tao ung dung express
const PORT = process.env.PORT || 3001; // Su dung bien moi truong hoac cong mac dinh 3000

app.use(bodyParser.json());
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kitchen_app_db';

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
    // Tạo một người dùng giả với mật khẩu đã mã hóa
    const createDummyUser = async () => {
      const dummyUsername = 'testuser';
      const dummyEmail = 'test@example.com';
      const dummyPassword = 'testpassword'; // Mật khẩu gốc
      const dummyFullName = 'Test User';
      const dummyRole = 'HOMEMAKER';

      try {
        // Kiểm tra xem người dùng đã tồn tại chưa để tránh tạo trùng lặp
        const existingUser = await User.findOne({ $or: [{ username: dummyUsername }, { email: dummyEmail }] });

        if (!existingUser) {
          // Nếu người dùng chưa tồn tại, tiến hành mã hóa mật khẩu và tạo mới
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dummyPassword, salt);

          const newUser = new User({
            username: dummyUsername,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            fullName: dummyFullName,
            email: dummyEmail,
            role: dummyRole,
          });
          await newUser.save();
          console.log('Dummy user "testuser" created with hashed password!');
        } else {
          console.log('Dummy user "testuser" already exists (username or email duplicate).');
        }
      } catch (err) {
        // Ghi nhận lỗi nếu có vấn đề trong quá trình tạo/kiểm tra người dùng giả
        console.error('Error creating/checking dummy user:', err);
      }
    };
    createDummyUser(); // Gọi hàm tạo người dùng giả khi kết nối DB thành công
    // *************************************************************************

  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  });

// su dung cac router
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const pantryItemRoutes = require('./routes/pantryItemRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const authRoutes = require('./routes/authRoutes'); // NEW: Import auth routes

// Mount cac router vao cac duong dan co so tuong ung
app.use('/api/shoppinglists', shoppingListRoutes);
app.use('/api/pantryitems', pantryItemRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api', authRoutes); // NEW: Mount auth routes (bao gồm /api/register và /api/login)

// xuat app
module.exports = app;
