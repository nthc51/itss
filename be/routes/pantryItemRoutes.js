// routes/pantryItemRoutes.js
const express = require('express');
const router = express.Router();
const { PantryItem, User, Unit, FoodCategory } = require('../models/models'); // Import các model cần thiết

// Middleware để kiểm tra và lấy người dùng (có thể bạn đã có hoặc sẽ cần triển khai Auth Middleware thực tế)
// const auth = require('../middleware/auth'); // Ví dụ nếu có middleware xác thực

// --- ROUTE LẤY DANH SÁCH THỰC PHẨM HẾT HẠN (Đã có) ---
router.get('/expired', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để lấy thực phẩm hết hạn.' });
        }

        const expiredItems = await PantryItem.find({
            ownedBy: userId,
            expirationDate: { $lte: new Date() }
        })
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .sort({ expirationDate: 1 });

        res.status(200).json(expiredItems);
    } catch (error) {
        console.error('Lỗi khi lấy thực phẩm hết hạn:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy thực phẩm hết hạn.' });
    }
});

// --- ROUTE LẤY DANH SÁCH THỰC PHẨM SẮP HẾT HẠN (NEW) ---
router.get('/expiring-soon', async (req, res) => {
    try {
        const userId = req.query.userId;
        const daysThreshold = parseInt(req.query.daysThreshold) || 7; // Mặc định 7 ngày tới

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để lấy thực phẩm sắp hết hạn.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt về đầu ngày

        const expiringSoonDate = new Date();
        expiringSoonDate.setDate(today.getDate() + daysThreshold); // Ngày kết thúc của khoảng thời gian

        const expiringSoonItems = await PantryItem.find({
            ownedBy: userId,
            expirationDate: {
                $gt: today, // Lớn hơn ngày hôm nay
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
});


// 1. Tạo Pantry Item mới (CREATE)
router.post('/', async (req, res) => {
    try {
        const { name, quantity, unit, expirationDate, location, category, ownedBy } = req.body;

        // Kiểm tra xem ownedBy (userId) có tồn tại không
        const existingUser = await User.findById(ownedBy);
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found for ownedBy field.' });
        }
        // Kiểm tra unit và category có tồn tại không (tùy chọn nhưng nên có validation)
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
        res.status(500).json({ message: error.message });
    }
});

// 2. Lấy tất cả Pantry Items hoặc theo user (READ)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.ownedBy = userId;
        }
        const pantryItems = await PantryItem.find(query)
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');
        res.status(200).json(pantryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Lay mot Pantry Item theo ID (READ)
router.get('/:id', async (req, res) => {
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
});

// 4. Cap nhat Pantry Item (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await PantryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
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
});

// 5. Xoa Pantry Item (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json({ message: 'Pantry item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; // Export router
