// routes/mealPlanRoutes.js
const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);

router.post('/', mealPlanController.createMealPlan);
router.get('/', mealPlanController.getMealPlans);
router.get('/:id', mealPlanController.getMealPlanById);
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);

router.get('/suggestions', mealPlanController.getMealPlanSuggestions); // Giữ nguyên, cần route riêng vì không có ID

// Thêm route này nếu bạn chưa có, để tạo danh sách mua sắm từ một meal plan cụ thể
router.post('/:id/generate-shopping-list', mealPlanController.generateShoppingListFromMealPlan);

module.exports = router;