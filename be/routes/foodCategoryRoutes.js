// routes/foodCategoryRoutes.js
const express = require('express');
const router = express.Router();
const foodCategoryController = require('../controllers/foodCategoryController');
const authMiddleware = require('../middleware/authMiddleware'); // Áp dụng bảo vệ

router.use(authMiddleware.protect);

router.post('/', foodCategoryController.createFoodCategory);
router.get('/', foodCategoryController.getFoodCategories);
router.get('/:id', foodCategoryController.getFoodCategoryById);
router.put('/:id', foodCategoryController.updateFoodCategory);
router.delete('/:id', foodCategoryController.deleteFoodCategory);

module.exports = router;