// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // <-- Thêm dòng này
const { User } = require("../models/models"); // Import model User
require('dotenv').config(); // <-- Thêm dòng này để load biến môi trường

// Hàm tạo token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// --- HÀM ĐĂNG KÝ (REGISTER) ---
// ... (giữ nguyên logic register như đã có) ...
exports.register = async (req, res) => {
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
            role: role || "HOMEMAKER", // Mặc định vai trò là HOMEMAKER
        });

        await newUser.save();
        console.log(`Người dùng mới đã đăng ký: ${username}`);

        // Sau khi đăng ký thành công, cũng có thể tạo token và đăng nhập luôn
        const token = generateToken(newUser._id); // Tạo token
        res.status(201).json({
            message: "Đăng ký tài khoản thành công!",
            token, // <-- Thêm token vào response
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
};


// --- HÀM ĐĂNG NHẬP (LOGIN) ---
exports.login = async (req, res) => {
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

        // --- TẠO TOKEN KHI ĐĂNG NHẬP THÀNH CÔNG ---
        const token = generateToken(user._id); // Tạo token cho user._id
        // ----------------------------------------

        console.log(`Người dùng ${user.username} đã đăng nhập thành công.`);
        res.status(200).json({
            message: `Đăng nhập thành công! Chào mừng, ${user.fullName}!`,
            token, // <-- Gửi token về client
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
};

// --- HÀM LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI ---
// (req.user sẽ được điền bởi middleware authMiddleware.protect)
exports.getMe = async (req, res) => {
    try {
        // req.user được thiết lập bởi authMiddleware.protect
        // Nó chứa thông tin người dùng từ token đã giải mã
        const user = await User.findById(req.user.id).select('-password'); // Bỏ qua mật khẩu
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            message: 'Thông tin người dùng hiện tại',
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng.' });
    }
};