// controllers/pantryItemController.js
const { PantryItem, User, Unit, FoodCategory } = require('../models/models'); // Import các model cần thiết

// --- LẤY DANH SÁCH THỰC PHẨM HẾT HẠN ---
exports.getExpiredPantryItems = async (req, res) => {
    try {
        // userId có thể đến từ req.query hoặc từ req.user (nếu đã được xác thực qua middleware)
        const userId = req.user ? req.user.id : req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để lấy thực phẩm hết hạn.' });
        }

        const expiredItems = await PantryItem.find({
            ownedBy: userId,
            expirationDate: { $lte: new Date() } // Lọc các mục có ngày hết hạn nhỏ hơn hoặc bằng ngày hiện tại
        })
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .sort({ expirationDate: 1 }); // Sắp xếp theo ngày hết hạn tăng dần

        res.status(200).json(expiredItems);
    } catch (error) {
        console.error('Lỗi khi lấy thực phẩm hết hạn:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy thực phẩm hết hạn.' });
    }
};

// --- LẤY DANH SÁCH THỰC PHẨM SẮP HẾT HẠN ---
exports.getExpiringSoonPantryItems = async (req, res) => {
    try {
        // userId có thể đến từ req.query hoặc từ req.user (nếu đã được xác thực qua middleware)
        const userId = req.user ? req.user.id : req.query.userId;
        const daysThreshold = parseInt(req.query.daysThreshold) || 7; // Mặc định 7 ngày tới nếu không được chỉ định

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để lấy thực phẩm sắp hết hạn.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt về đầu ngày hiện tại

        const expiringSoonDate = new Date();
        expiringSoonDate.setDate(today.getDate() + daysThreshold); // Ngày kết thúc của khoảng thời gian ngưỡng

        const expiringSoonItems = await PantryItem.find({
            ownedBy: userId,
            expirationDate: {
                $gt: today, // Lớn hơn ngày hôm nay (không bao gồm hôm nay nếu hôm nay là ngày hết hạn)
                $lte: expiringSoonDate // Nhỏ hơn hoặc bằng ngày hết hạn trong ngưỡng
            }
        })
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .sort({ expirationDate: 1 }); // Sắp xếp theo ngày hết hạn tăng dần

        res.status(200).json(expiringSoonItems);
    } catch (error) {
        console.error('Lỗi khi lấy thực phẩm sắp hết hạn:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy thực phẩm sắp hết hạn.' });
    }
};

// --- TẠO PANTRY ITEM MỚI (CREATE) ---
exports.createPantryItem = async (req, res) => {
    try {
        const { name, quantity, unit, expirationDate, location, category, ownedBy } = req.body;

        // Xác thực người dùng sở hữu (ownedBy)
        const existingUser = await User.findById(ownedBy); // Dùng ownedBy từ body, nhưng trong thực tế nên lấy từ req.user.id
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found for ownedBy field.' });
        }
        // Xác thực unit và category (tùy chọn nhưng rất nên có)
        const existingUnit = await Unit.findById(unit);
        if (!existingUnit) {
            return res.status(400).json({ message: 'Unit not found.' });
        }
        const existingCategory = await FoodCategory.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ message: 'Category not found.' });
        }

        const newPantryItem = new PantryItem({
            name, quantity, unit, expirationDate, location, category, ownedBy
        });
        const savedItem = await newPantryItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        // Xử lý lỗi validation hoặc lỗi database khác
        res.status(500).json({ message: error.message });
    }
};

// --- LẤY TẤT CẢ PANTRY ITEMS HOẶC THEO NGƯỜI DÙNG (READ ALL/BY USER) ---
exports.getPantryItems = async (req, res) => {
    try {
        // Lấy userId từ query hoặc từ thông tin người dùng đã xác thực
        const userId = req.user ? req.user.id : req.query.userId;
        let query = {};
        if (userId) {
            query.ownedBy = userId; // Lọc theo người sở hữu
        }

        const pantryItems = await PantryItem.find(query)
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName'); // Populate thông tin người sở hữu
        res.status(200).json(pantryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- LẤY MỘT PANTRY ITEM THEO ID (READ ONE) ---
exports.getPantryItemById = async (req, res) => {
    try {
        const pantryItem = await PantryItem.findById(req.params.id)
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');
        if (!pantryItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json(pantryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CẬP NHẬT PANTRY ITEM (UPDATE) ---
exports.updatePantryItem = async (req, res) => {
    try {
        const updatedItem = await PantryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // `new: true` trả về tài liệu đã cập nhật, `runValidators` chạy lại validation schema
        )
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');
        if (!updatedItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- XÓA PANTRY ITEM (DELETE) ---
exports.deletePantryItem = async (req, res) => {
    try {
        const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json({ message: 'Pantry item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};