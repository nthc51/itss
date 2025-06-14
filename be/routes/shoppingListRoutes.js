// routes/shoppingListRoutes.js
const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController'); // Import controller mới
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware xác thực

// Áp dụng authentication middleware cho tất cả các route danh sách mua sắm
router.use(authMiddleware.protect);

// Routes cho các tài liệu ShoppingList
router.post('/', shoppingListController.createShoppingList);
router.post('/:id/items', shoppingListController.addItemToShoppingList); // <-- Dòng này đã được sửa
router.get('/', shoppingListController.getShoppingLists);
router.get('/:id', shoppingListController.getShoppingListById);
router.put('/:id', shoppingListController.updateShoppingList);
router.delete('/:id', shoppingListController.deleteShoppingList);

// Các route cho các hoạt động trên sub-documents ShoppingListItem (nếu có trong ứng dụng của bạn)
// Các route này không có trong file bạn cung cấp, nhưng tôi để đây làm ví dụ nếu bạn muốn thêm
router.put('/:id/add-item', shoppingListController.addShoppingListItem); // Thêm mục
router.put('/:id/update-item/:itemId', shoppingListController.updateShoppingListItem); // Cập nhật mục
router.put('/:id/remove-item/:itemId', shoppingListController.removeShoppingListItem); // Xóa mục

module.exports = router;