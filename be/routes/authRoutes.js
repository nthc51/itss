// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const { User } = require('../models/models'); // Import User model

// --- ROUTE ĐĂNG KÝ (REGISTER) ---
router.post('/register', async (req, res) => {
    const { username, password, fullName, email, role } = req.body;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!username || !password || !fullName || !email) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên người dùng, Mật khẩu, Họ tên và Email.' });
    }

    try {
        // 2. Kiểm tra tên người dùng hoặc email đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.' });
            }
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'Email đã được sử dụng. Vui lòng dùng email khác.' });
            }
        }

        // 3. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10); // Tạo salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash mật khẩu

        // 4. Tạo người dùng mới
        const newUser = new User({
            username,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            fullName,
            email,
            role: role || 'HOMEMAKER', // Vai trò mặc định là HOMEMAKER
        });

        // 5. Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();

        // 6. Phản hồi thành công
        console.log(`Người dùng mới đã đăng ký: ${username}`);
        res.status(201).json({
            message: 'Đăng ký tài khoản thành công!',
            user: {
                id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng ký.' });
    }
});

// --- ROUTE ĐĂNG NHẬP (LOGIN) ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền Tên người dùng và Mật khẩu.' });
    }

    try {
        // 2. Tìm người dùng theo tên đăng nhập
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không đúng.' });
        }

        // 3. So sánh mật khẩu đã cung cấp với mật khẩu đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không đúng.' });
        }

        // 4. Đăng nhập thành công
        // TRONG ỨNG DỤNG THỰC TẾ: Tại đây, bạn sẽ tạo và gửi một JSON Web Token (JWT)
        // hoặc thiết lập một phiên (session) để duy trì trạng thái đăng nhập.
        console.log(`Người dùng ${username} đã đăng nhập thành công.`);
        res.status(200).json({
            message: `Đăng nhập thành công! Chào mừng, ${user.fullName}!`,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
                // KHÔNG BAO GIỜ GỬI MẬT KHẨU VỀ CLIENT!
            }
        });

    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.' });
    }
});

module.exports = router;