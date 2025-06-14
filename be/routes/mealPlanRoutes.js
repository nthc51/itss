// routes/mealPlanRoutes.js (Đã sửa đổi thứ tự route)
const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController'); // Import controller mới
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware xác thực

// Áp dụng authentication middleware cho tất cả các route kế hoạch bữa ăn
router.use(authMiddleware.protect);

// Route cho tính năng gợi ý bữa ăn (CẦN ĐẶT LÊN ĐẦU CÁC GET ROUTES CÓ ID)
router.get('/suggestions', mealPlanController.getMealPlanSuggestions);

// Routes cho các hoạt động CRUD trên MealPlan (get by ID phải sau suggestions)
router.post('/', mealPlanController.createMealPlan);
router.get('/', mealPlanController.getMealPlans);
router.get('/:id', mealPlanController.getMealPlanById); // Route lấy 1 meal plan theo ID
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);


// Route để tạo danh sách mua sắm từ một meal plan (nếu có)
router.post('/:id/generate-shopping-list', mealPlanController.generateShoppingListFromMealPlan);


module.exports = router;