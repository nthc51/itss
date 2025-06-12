// controllers/shoppingListController.js
const { ShoppingList, User, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// 1. Tạo danh sách mua sắm mới (CREATE)
exports.createShoppingList = async (req, res) => {
    try {
        const { title, startDate, endDate, items, createdBy, sharedWithGroup } = req.body;

        // Trong một ứng dụng thực tế với JWT, createdBy sẽ được lấy từ req.user.id sau khi xác thực
        // const createdByUserId = req.user.id;
        // Kiểm tra xem ownedBy (userId) có tồn tại không
        const existingUser = await User.findById(createdBy); // Tạm thời dùng createdBy từ body
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const newShoppingList = new ShoppingList({ title, startDate, endDate, items, createdBy, sharedWithGroup });
        const savedList = await newShoppingList.save();
        res.status(201).json(savedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy tất cả danh sách mua sắm hoặc theo user (READ)
exports.getShoppingLists = async (req, res) => {
    try {
        // Lấy userId từ query hoặc từ thông tin người dùng đã xác thực (req.user.id)
        const userId = req.user ? req.user.id : req.query.userId;
        let query = {};
        if (userId) {
            query.createdBy = userId;
        }

        const shoppingLists = await ShoppingList.find(query)
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        res.status(200).json(shoppingLists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Lấy một danh sách mua sắm theo ID (READ)
exports.getShoppingListById = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id)
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json(shoppingList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật danh sách mua sắm (UPDATE)
exports.updateShoppingList = async (req, res) => {
    try {
        const updatedList = await ShoppingList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // `new: true` trả về tài liệu đã cập nhật, `runValidators` chạy lại validation schema
        )
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        if (!updatedList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json(updatedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Xóa danh sách mua sắm (DELETE)
exports.deleteShoppingList = async (req, res) => {
    try {
        const deletedList = await ShoppingList.findByIdAndDelete(req.params.id);
        if (!deletedList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json({ message: 'Shopping list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const initialLength = shoppingList.items.length;
        shoppingList.items.pull(itemId); // Xóa sub-document theo ID

        if (shoppingList.items.length === initialLength) {
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