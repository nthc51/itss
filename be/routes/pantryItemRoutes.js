// routes/pantryItemRoutes.js
const express = require('express');
const router = express.Router();
const pantryItemController = require('../controllers/pantryItemController'); // Import controller mới
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware xác thực

// Áp dụng authentication middleware cho tất cả các route pantry-items
router.use(authMiddleware.protect);

// Routes cho các tính năng đặc biệt (hết hạn, sắp hết hạn)
router.get('/expired', pantryItemController.getExpiredPantryItems);
router.get('/expiring-soon', pantryItemController.getExpiringSoonPantryItems);

// Routes cho các hoạt động CRUD cơ bản trên PantryItem
router.post('/', pantryItemController.createPantryItem);
router.get('/', pantryItemController.getPantryItems);
router.get('/:id', pantryItemController.getPantryItemById);
router.put('/:id', pantryItemController.updatePantryItem);
router.delete('/:id', pantryItemController.deletePantryItem);

module.exports = router;