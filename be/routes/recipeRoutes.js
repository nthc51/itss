// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController'); // Import controller mới
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware xác thực

// Áp dụng authentication middleware cho tất cả các route công thức
router.use(authMiddleware.protect);

// Routes cho các hoạt động CRUD trên Recipe
router.post('/', recipeController.createRecipe);
router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById); // Thêm route để lấy công thức theo ID
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;