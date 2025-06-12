// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/models'); // Hoặc User model riêng
require('dotenv').config(); // Load biến môi trường

exports.protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem token có trong header Authorization không (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác minh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng dựa trên ID trong token và gắn vào req.user
      req.user = await User.findById(decoded.id).select('-password'); // Không trả về mật khẩu

      if (!req.user) {
        return res.status(401).json({ message: 'Không được ủy quyền, người dùng không tồn tại.' });
      }

      next(); // Chuyển sang middleware/route handler tiếp theo
    } catch (error) {
      console.error('Lỗi xác thực token:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
      }
      return res.status(401).json({ message: 'Không được ủy quyền, token không hợp lệ.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không được ủy quyền, không có token.' });
  }
};