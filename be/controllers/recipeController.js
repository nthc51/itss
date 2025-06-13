// controllers/recipeController.js
const { Recipe, User, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// Hàm trợ giúp để kiểm tra các ingredients
const validateIngredients = async (ingredients) => {
    if (!ingredients || ingredients.length === 0) {
        return { isValid: true, message: null };
    }

    for (const ingredient of ingredients) {
        // Kiểm tra xem các trường cần thiết có tồn tại không
        if (!ingredient.name || typeof ingredient.quantity === 'undefined' || !ingredient.unit || !ingredient.category) {
            return { isValid: false, message: `Ingredient missing required fields (name, quantity, unit, or category). Found: ${JSON.stringify(ingredient)}` };
        }

        // Kiểm tra sự tồn tại của Unit
        const existingUnit = await Unit.findById(ingredient.unit);
        if (!existingUnit) {
            return { isValid: false, message: `Unit with ID '${ingredient.unit}' not found for ingredient '${ingredient.name}'.` };
        }

        // Kiểm tra sự tồn tại của FoodCategory
        const existingCategory = await FoodCategory.findById(ingredient.category);
        if (!existingCategory) {
            return { isValid: false, message: `Category with ID '${ingredient.category}' not found for ingredient '${ingredient.name}'.` };
        }
    }
    return { isValid: true, message: null };
};


// 1. Thêm công thức mới (CREATE)
exports.createRecipe = async (req, res) => {
    try {
        const { title, instructions, servings, ingredients, createdBy } = req.body;

        // Trong một ứng dụng thực tế với JWT, createdBy nên được lấy từ req.user.id sau khi xác thực
        // const createdByUserId = req.user.id;
        // Kiểm tra xem người tạo (createdBy) có tồn tại không
        const existingUser = await User.findById(createdBy); // Tạm thời dùng createdBy từ body
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // --- Bắt đầu thêm validation cho ingredients ---
        const { isValid, message } = await validateIngredients(ingredients);
        if (!isValid) {
            return res.status(400).json({ message });
        }
        // --- Kết thúc validation cho ingredients ---

        const newRecipe = new Recipe({ title, instructions, servings, ingredients, createdBy });
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        // Xử lý lỗi validation hoặc lỗi database khác
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy tất cả công thức (READ ALL)
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('createdBy', 'username fullName') // Populate thông tin người tạo
            .populate('ingredients.category', 'name')   // Populate thông tin danh mục của từng nguyên liệu
            .populate('ingredients.unit', 'name abbreviation'); // Populate thông tin đơn vị của từng nguyên liệu
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Lấy một công thức theo ID (READ ONE)
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'username fullName')
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật công thức (UPDATE)
exports.updateRecipe = async (req, res) => {
    try {
        // Lấy dữ liệu cập nhật từ req.body
        const updates = req.body;

        // Nếu có trường 'ingredients' trong updates, thì chạy validation
        if (updates.ingredients) {
            const { isValid, message } = await validateIngredients(updates.ingredients);
            if (!isValid) {
                return res.status(400).json({ message });
            }
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            updates, // Sử dụng updates từ req.body
            { new: true, runValidators: true } // `new: true` trả về tài liệu đã cập nhật, `runValidators` chạy lại validation schema
        )
            .populate('createdBy', 'username fullName')
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Xóa công thức (DELETE)
exports.deleteRecipe = async (req, res) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};