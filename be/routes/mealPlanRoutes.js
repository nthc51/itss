// routes/mealPlanRoutes.js
const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController'); // Import controller mới
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware xác thực

// Áp dụng authentication middleware cho tất cả các route kế hoạch bữa ăn
router.use(authMiddleware.protect);

// Routes cho các hoạt động CRUD trên MealPlan
router.post('/', mealPlanController.createMealPlan);
router.get('/', mealPlanController.getMealPlans);
router.get('/:id', mealPlanController.getMealPlanById); // Route lấy 1 meal plan theo ID
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);

// Route cho tính năng gợi ý bữa ăn
router.get('/suggestions', mealPlanController.getMealPlanSuggestions);

module.exports = router;