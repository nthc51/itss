// controllers/pantryItemController.js
const { PantryItem, User, Unit, FoodCategory } = require('../models/models'); // Import các model cần thiết

// --- LẤY DANH SÁCH THỰC PHẨM HẾT HẠN ---
exports.getExpiredPantryItems = async (req, res) => {
    try {
        // userId sẽ luôn có từ req.user.id do middleware bảo vệ route
        const userId = req.user.id;

        // Không cần kiểm tra if (!userId) vì authMiddleware.protect đã đảm bảo
        // Tuy nhiên, có thể thêm log lỗi nếu muốn đảm bảo req.user.id luôn tồn tại ở đây

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
        // userId sẽ luôn có từ req.user.id do middleware bảo vệ route
        const userId = req.user.id;
        const daysThreshold = parseInt(req.query.daysThreshold) || 7; // Mặc định 7 ngày tới nếu không được chỉ định

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt về đầu ngày hiện tại

        const expiringSoonDate = new Date();
        expiringSoonDate.setDate(today.getDate() + daysThreshold); // Ngày kết thúc của khoảng thời gian ngưỡng

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
};

// --- TẠO PANTRY ITEM MỚI (CREATE) ---
exports.createPantryItem = async (req, res) => {
    try {
        const { name, quantity, unit, category, purchaseDate, expirationDate, location } = req.body;

        // DEBUG LOG: Kiểm tra req.user và req.user.id
        console.log("DEBUG: req.user:", req.user);
        console.log("DEBUG: req.user.id:", req.user ? req.user.id : "No user ID");

        // Đảm bảo req.user được thiết lập bởi authMiddleware (đã được đảm bảo bởi protect middleware)
        if (!req.user || !req.user.id) {
            console.error("Lỗi: Người dùng không xác thực hoặc thiếu ID người dùng (Lẽ ra đã được xử lý bởi middleware).");
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }

        const newPantryItem = new PantryItem({
            name,
            quantity,
            unit,
            category,
            purchaseDate,
            expirationDate,
            location,
            ownedBy: req.user.id // Gán pantry item cho người dùng hiện tại
        });

        // DEBUG LOG: Kiểm tra đối tượng PantryItem trước khi lưu
        console.log("DEBUG: newPantryItem before save:", newPantryItem);

        const savedPantryItem = await newPantryItem.save();

        res.status(201).json(savedPantryItem);
    } catch (error) {
        // DEBUG LOG: Ghi lại TOÀN BỘ đối tượng lỗi
        console.error("Error creating pantry item:", error);
        // Kiểm tra xem lỗi có phải là lỗi validation Mongoose không
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }

        res.status(500).json({ message: error.message || 'Lỗi server khi tạo thực phẩm trong kho.' });
    }
};

// --- LẤY TẤT CẢ PANTRY ITEMS CỦA NGƯỜI DÙNG (READ ALL) ---
exports.getPantryItems = async (req, res) => {
    try {
        // Lấy userId từ thông tin người dùng đã xác thực (req.user.id)
        const userId = req.user.id;

        const pantryItems = await PantryItem.find({ ownedBy: userId }) // <-- Lọc theo người sở hữu
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName'); // Populate thông tin người sở hữu
        res.status(200).json(pantryItems);
    } catch (error) {
        console.error("Error getting pantry items:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
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

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xem chi tiết
        if (pantryItem.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập pantry item này.' });
        }

        res.status(200).json(pantryItem);
    } catch (error) {
        console.error("Error getting pantry item by ID:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// --- CẬP NHẬT PANTRY ITEM (UPDATE) ---
exports.updatePantryItem = async (req, res) => {
    try {
        // Tìm pantry item trước để kiểm tra quyền sở hữu
        const pantryItemToUpdate = await PantryItem.findById(req.params.id);
        if (!pantryItemToUpdate) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể cập nhật
        if (pantryItemToUpdate.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật pantry item này.' });
        }

        const updatedItem = await PantryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');

        if (!updatedItem) { // Kiểm tra lại sau update attempt
            return res.status(404).json({ message: 'Pantry item not found after update attempt.' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Error updating pantry item:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// --- XÓA PANTRY ITEM (DELETE) ---
exports.deletePantryItem = async (req, res) => {
    try {
        // Tìm pantry item trước để kiểm tra quyền sở hữu
        const pantryItemToDelete = await PantryItem.findById(req.params.id);
        if (!pantryItemToDelete) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xóa
        if (pantryItemToDelete.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xóa pantry item này.' });
        }

        const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) { // Kiểm tra lại, mặc dù đã kiểm tra ở trên
            return res.status(404).json({ message: 'Pantry item not found after delete attempt.' });
        }
        res.status(200).json({ message: 'Pantry item deleted successfully' });
    } catch (error) {
        console.error("Error deleting pantry item:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};