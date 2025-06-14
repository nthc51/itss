// controllers/shoppingListController.js
const { ShoppingList, User, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// 1. Tạo danh sách mua sắm mới (CREATE)
exports.createShoppingList = async (req, res) => {
    try {
        const { name, items } = req.body;

        // DEBUG LOG: Kiểm tra req.user và req.user.id TRONG SHOPPINGLIST CONTROLLER
        console.log("DEBUG SHOPPINGLIST: req.user:", req.user);
        console.log("DEBUG SHOPPINGLIST: req.user.id:", req.user ? req.user.id : "No user ID");

        // Đảm bảo req.user được thiết lập bởi authMiddleware (đã được đảm bảo bởi protect middleware)
        if (!req.user || !req.user.id) {
            console.error("Lỗi ShoppingList: Người dùng không xác thực hoặc thiếu ID người dùng (Lẽ ra đã được xử lý bởi middleware).");
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }

        // Tạo một Shopping List mới
        const newShoppingList = new ShoppingList({
            name,
            items,
            ownedBy: req.user.id // Gán shopping list cho người dùng hiện tại
        });

        // DEBUG LOG: Kiểm tra đối tượng ShoppingList trước khi lưu
        console.log("DEBUG SHOPPINGLIST: newShoppingList before save:", newShoppingList);

        const savedShoppingList = await newShoppingList.save();

        res.status(201).json(savedShoppingList);
    } catch (error) {
        // DEBUG LOG: Ghi lại TOÀN BỘ đối tượng lỗi cho ShoppingList
        console.error("Error creating shopping list:", error);
        // Cải thiện thông báo lỗi nếu là lỗi xác thực Mongoose
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo danh sách mua sắm.' });
    }
};

// 2. Lấy tất cả danh sách mua sắm của người dùng (READ)
exports.getShoppingLists = async (req, res) => {
    try {
        // userId sẽ luôn có từ req.user.id do middleware bảo vệ route
        const userId = req.user.id;

        const shoppingLists = await ShoppingList.find({ ownedBy: userId }) // <-- THAY ĐỔI Ở ĐÂY: Lọc theo ownedBy
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate ownedBy
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        res.status(200).json(shoppingLists);
    } catch (error) {
        console.error("Error getting shopping lists:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 3. Lấy một danh sách mua sắm theo ID (READ)
exports.getShoppingListById = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id)
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate ownedBy
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xem chi tiết
        if (shoppingList.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập danh sách mua sắm này.' });
        }

        res.status(200).json(shoppingList);
    } catch (error) {
        console.error("Error getting shopping list by ID:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 4. Cập nhật danh sách mua sắm (UPDATE)
exports.updateShoppingList = async (req, res) => {
    try {
        // Tìm danh sách mua sắm trước để kiểm tra quyền sở hữu
        const shoppingListToUpdate = await ShoppingList.findById(req.params.id);
        if (!shoppingListToUpdate) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể cập nhật
        if (shoppingListToUpdate.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật danh sách mua sắm này.' });
        }

        const updatedList = await ShoppingList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate ownedBy
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');

        if (!updatedList) { // Kiểm tra lại sau update attempt
            return res.status(404).json({ message: 'Shopping list not found after update attempt.' });
        }
        res.status(200).json(updatedList);
    } catch (error) {
        console.error("Error updating shopping list:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 5. Xóa danh sách mua sắm (DELETE)
exports.deleteShoppingList = async (req, res) => {
    try {
        // Tìm danh sách mua sắm trước để kiểm tra quyền sở hữu
        const shoppingListToDelete = await ShoppingList.findById(req.params.id);
        if (!shoppingListToDelete) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xóa
        if (shoppingListToDelete.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xóa danh sách mua sắm này.' });
        }

        const deletedList = await ShoppingList.findByIdAndDelete(req.params.id);
        if (!deletedList) { // Kiểm tra lại, mặc dù đã kiểm tra ở trên
            return res.status(404).json({ message: 'Shopping list not found after delete attempt.' });
        }
        res.status(200).json({ message: 'Shopping list deleted successfully' });
    } catch (error) {
        console.error("Error deleting shopping list:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// --- LOGIC MỚI CHO THAO TÁC TRÊN ITEM CỦA DANH SÁCH MUA SẮM ---

// Thêm một mục mới vào danh sách mua sắm
exports.addShoppingListItem = async (req, res) => {
    try {
        const { id } = req.params; // ID của shopping list
        const { name, quantity, unit, category, bought = false } = req.body; // Thông tin của item mới

        const shoppingList = await ShoppingList.findById(id);
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể thêm mục
        if (shoppingList.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền thêm mục vào danh sách mua sắm này.' });
        }

        // Tạo đối tượng item mới
        const newItem = {
            name,
            quantity,
            unit,    // Chắc chắn rằng đây là ObjectId nếu schema của bạn dùng ref
            category, // Chắc chắn rằng đây là ObjectId nếu schema của bạn dùng ref
            bought
        };

        shoppingList.items.push(newItem); // Thêm item vào mảng con
        await shoppingList.save(); // Lưu thay đổi

        // Có thể populate lại để trả về item đã thêm với thông tin đầy đủ
        const updatedShoppingList = await ShoppingList.findById(id)
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');

        res.status(201).json({
            message: 'Item added to shopping list successfully',
            shoppingList: updatedShoppingList
        });

    } catch (error) {
        console.error('Error adding item to shopping list:', error);
        res.status(500).json({ message: error.message || 'Error adding item to shopping list.' });
    }
};

// Cập nhật một mục trong danh sách mua sắm
exports.updateShoppingListItem = async (req, res) => {
    try {
        const { id, itemId } = req.params; // id là shoppingListId, itemId là id của item trong mảng
        const updates = req.body; // Các trường cần cập nhật (name, quantity, unit, category, bought)

        const shoppingList = await ShoppingList.findById(id);
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể cập nhật mục
        if (shoppingList.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật mục trong danh sách mua sắm này.' });
        }

        const itemToUpdate = shoppingList.items.id(itemId); // Tìm sub-document theo ID
        if (!itemToUpdate) {
            return res.status(404).json({ message: 'Item not found in this shopping list.' });
        }

        // Cập nhật các trường của item
        Object.assign(itemToUpdate, updates); // Gán các cập nhật từ req.body vào itemToUpdate

        await shoppingList.save(); // Lưu thay đổi

        // Có thể populate lại để trả về item đã cập nhật với thông tin đầy đủ
        const updatedShoppingList = await ShoppingList.findById(id)
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');

        res.status(200).json({
            message: 'Shopping list item updated successfully',
            shoppingList: updatedShoppingList
        });

    } catch (error) {
        console.error('Error updating item in shopping list:', error);
        res.status(500).json({ message: error.message || 'Error updating item in shopping list.' });
    }
};

// Xóa một mục khỏi danh sách mua sắm
exports.removeShoppingListItem = async (req, res) => {
    try {
        const { id, itemId } = req.params; // id là shoppingListId, itemId là id của item trong mảng

        const shoppingList = await ShoppingList.findById(id);
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xóa mục
        if (shoppingList.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xóa mục khỏi danh sách mua sắm này.' });
        }

        const initialLength = shoppingList.items.length;
        shoppingList.items.pull(itemId); // Xóa sub-document theo ID

        if (shoppingList.items.length === initialLength) {
            // Nếu độ dài không đổi, có nghĩa là item không được tìm thấy
            return res.status(404).json({ message: 'Item not found in this shopping list.' });
        }

        await shoppingList.save(); // Lưu thay đổi

        // Có thể populate lại để trả về danh sách đã xóa item
        const updatedShoppingList = await ShoppingList.findById(id)
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');

        res.status(200).json({
            message: 'Shopping list item removed successfully',
            shoppingList: updatedShoppingList
        });

    } catch (error) {
        console.error('Error removing item from shopping list:', error);
        res.status(500).json({ message: error.message || 'Error removing item from shopping list.' });
    }
};