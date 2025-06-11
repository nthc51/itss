// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../models/models");

// --- ROUTE ĐĂNG KÝ (REGISTER) ---
// Accessible at POST /auth/register
router.post("/register", async (req, res) => {
  const { username, password, fullName, email, role } = req.body;

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({
      message:
        "Vui lòng điền đầy đủ Tên người dùng, Mật khẩu, Họ tên và Email.",
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({
          message: "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.",
        });
      }
      if (existingUser.email === email) {
        return res.status(409).json({
          message: "Email đã được sử dụng. Vui lòng dùng email khác.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      role: role || "HOMEMAKER",
    });

    await newUser.save();
    console.log(`Người dùng mới đã đăng ký: ${username}`);
    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký." });
  }
});

// --- ROUTE ĐĂNG NHẬP (LOGIN) ---
// Accessible at POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền Email và Mật khẩu." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    console.log(`Người dùng ${user.username} đã đăng nhập thành công.`);
    res.status(200).json({
      message: `Đăng nhập thành công! Chào mừng, ${user.fullName}!`,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập." });
  }
});

module.exports = router;
