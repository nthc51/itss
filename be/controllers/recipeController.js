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
        const { title, instructions, servings, ingredients, category, prepTime, cookTime, description } = req.body; // Thêm các trường khác của Recipe nếu có
        const ownedByUserId = req.user.id; // <-- Lấy ID người dùng từ middleware xác thực

        const existingUser = await User.findById(ownedByUserId);
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // --- Bắt đầu thêm validation cho ingredients ---
        const { isValid, message } = await validateIngredients(ingredients);
        if (!isValid) {
            return res.status(400).json({ message });
        }
        // --- Kết thúc validation cho ingredients ---

        const newRecipe = new Recipe({
            title,
            instructions,
            servings,
            ingredients,
            category,    // <-- Đảm bảo bạn truyền category vào đây nếu nó là required
            prepTime,    // <-- Đảm bảo bạn truyền prepTime vào đây
            cookTime,    // <-- Đảm bảo bạn truyền cookTime vào đây
            description, // <-- Đảm bảo bạn truyền description vào đây
            ownedBy: ownedByUserId // <-- GÁN ownedBy Ở ĐÂY
        });
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        console.error("Error creating recipe:", error); // Thêm log lỗi chi tiết
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 2. Lấy tất cả công thức (READ ALL)
exports.getRecipes = async (req, res) => {
    try {
        // Lọc theo người dùng sở hữu (nếu bạn muốn chỉ người dùng đó xem công thức của họ)
        // Nếu muốn tất cả người dùng xem, bỏ đoạn { ownedBy: req.user.id }
        const recipes = await Recipe.find({ ownedBy: req.user.id }) // <-- THAY ĐỔI Ở ĐÂY: Lọc theo ownedBy
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate 'ownedBy'
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error getting recipes:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 3. Lấy một công thức theo ID (READ ONE)
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate 'ownedBy'
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Tùy chọn: Thêm kiểm tra xem người dùng hiện tại có quyền truy cập công thức này không
        if (recipe.ownedBy && recipe.ownedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập công thức này.' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        console.error("Error getting recipe by ID:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 4. Cập nhật công thức (UPDATE)
exports.updateRecipe = async (req, res) => {
    try {
        const updates = req.body;

        // Kiểm tra xem người dùng hiện tại có quyền chỉnh sửa công thức này không
        const recipeToUpdate = await Recipe.findById(req.params.id);
        if (!recipeToUpdate) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Đảm bảo chỉ chủ sở hữu mới có thể cập nhật
        if (recipeToUpdate.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật công thức này.' });
        }

        if (updates.ingredients) {
            const { isValid, message } = await validateIngredients(updates.ingredients);
            if (!isValid) {
                return res.status(400).json({ message });
            }
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate 'ownedBy'
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');

        if (!updatedRecipe) { // Kiểm tra lại sau populate
            return res.status(404).json({ message: 'Recipe not found after update attempt.' });
        }
        res.status(200).json(updatedRecipe);
    } catch (error) {
        console.error("Error updating recipe:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};

// 5. Xóa công thức (DELETE)
exports.deleteRecipe = async (req, res) => {
    try {
        // Kiểm tra quyền sở hữu trước khi xóa
        const recipeToDelete = await Recipe.findById(req.params.id);
        if (!recipeToDelete) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (recipeToDelete.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xóa công thức này.' });
        }

        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!deletedRecipe) { // Nên không cần kiểm tra này nếu kiểm tra quyền sở hữu đã pass
            return res.status(404).json({ message: 'Recipe not found after delete attempt.' });
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error("Error deleting recipe:", error); // Thêm log lỗi
        res.status(500).json({ message: error.message || 'Đã xảy ra lỗi máy chủ.' });
    }
};