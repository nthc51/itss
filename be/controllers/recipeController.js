// controllers/recipeController.js
const { Recipe, User, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// 1. Thêm công thức mới (CREATE)
exports.createRecipe = async (req, res) => {
    try {
        const { title, instructions, servings, ingredients, createdBy } = req.body;

        // Trong một ứng dụng thực tế với JWT, createdBy sẽ được lấy từ req.user.id sau khi xác thực
        // const createdByUserId = req.user.id;
        // Kiểm tra xem người tạo (createdBy) có tồn tại không
        const existingUser = await User.findById(createdBy); // Tạm thời dùng createdBy từ body
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Tùy chọn: Bạn có thể thêm validation cho ingredients (ví dụ: kiểm tra unit và category có tồn tại không)
        // for (const ingredient of ingredients) {
        //     const existingUnit = await Unit.findById(ingredient.unit);
        //     if (!existingUnit) return res.status(400).json({ message: `Unit with ID ${ingredient.unit} not found for ingredient ${ingredient.name}.` });
        //     const existingCategory = await FoodCategory.findById(ingredient.category);
        //     if (!existingCategory) return res.status(400).json({ message: `Category with ID ${ingredient.category} not found for ingredient ${ingredient.name}.` });
        // }

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
// Hàm này không có trong file route bạn cung cấp nhưng là một phần quan trọng của CRUD, tôi sẽ thêm vào.
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
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
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