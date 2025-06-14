// controllers/mealPlanController.js (Đã sửa đổi)
const mongoose = require('mongoose');
const { MealPlan, User, Recipe, PantryItem, FoodCategory, Unit, ShoppingList } = require('../models/models');

// 1. Tạo kế hoạch bữa ăn mới (CREATE) - ĐÃ SỬA để populate sau khi tạo
exports.createMealPlan = async (req, res) => {
    try {
        const { title, date, type, recipes } = req.body;

        if (!req.user || !req.user.id) {
            console.error("Lỗi MealPlan: Người dùng không xác thực hoặc thiếu ID người dùng.");
            return res.status(401).json({ message: 'Người dùng chưa được xác thực.' });
        }

        if (!title || !date || !type || !Array.isArray(recipes)) {
            return res.status(400).json({ message: 'Tiêu đề, ngày, loại và danh sách công thức là bắt buộc.' });
        }
        if (recipes.length === 0) {
            return res.status(400).json({ message: 'Kế hoạch bữa ăn phải có ít nhất một công thức.' });
        }

        for (const recipeId of recipes) {
            if (!mongoose.Types.ObjectId.isValid(recipeId)) {
                return res.status(400).json({ message: `ID công thức không hợp lệ: ${recipeId}` });
            }
            const existingRecipe = await Recipe.findById(recipeId);
            if (!existingRecipe) {
                return res.status(404).json({ message: `Không tìm thấy công thức với ID: ${recipeId}.` });
            }
        }

        const newMealPlan = new MealPlan({
            title,
            date,
            type,
            recipes,
            ownedBy: req.user.id
        });

        const savedMealPlan = await newMealPlan.save();

        // Populate trường recipes với title sau khi lưu
        const populatedMealPlan = await MealPlan.findById(savedMealPlan._id)
            .populate({
                path: 'recipes',
                select: 'title'
            })
            .populate('ownedBy', 'username fullName'); // Nếu bạn cũng muốn populate ownedBy

        res.status(201).json(populatedMealPlan); // Trả về đối tượng đã được populate
    } catch (error) {
        console.error('Lỗi khi tạo kế hoạch bữa ăn:', error);
        if (error.name === 'ValidationError') {
            let errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }
        res.status(500).json({ message: 'Lỗi server nội bộ khi tạo kế hoạch bữa ăn.' });
    }
};

// 2. Lấy tất cả kế hoạch bữa ăn của người dùng (READ ALL) - ĐÃ CÓ POPULATE ĐÚNG RỒI
exports.getMealPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const mealPlans = await MealPlan.find({ ownedBy: userId })
            .populate('ownedBy', 'username fullName')
            .populate({
                path: 'recipes',
                select: 'title'
            });

        res.status(200).json(mealPlans);
    } catch (error) {
        console.error('Lỗi khi lấy kế hoạch bữa ăn:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ khi lấy kế hoạch bữa ăn.' });
    }
};

// 3. Lấy một kế hoạch bữa ăn theo ID (READ ONE) - ĐÃ CÓ POPULATE ĐÚNG RỒI
exports.getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate('ownedBy', 'username fullName')
            .populate({
                path: 'recipes',
                select: 'title'
            });

        if (!mealPlan) {
            return res.status(404).json({ message: 'Kế hoạch bữa ăn không tìm thấy.' });
        }

        if (mealPlan.ownedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập kế hoạch bữa ăn này.' });
        }

        res.status(200).json(mealPlan);
    } catch (error) {
        console.error('Lỗi khi lấy kế hoạch bữa ăn theo ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID kế hoạch bữa ăn không hợp lệ.' });
        }
        res.status(500).json({ message: 'Lỗi server nội bộ khi lấy kế hoạch bữa ăn.' });
    }
};

// 4. Cập nhật kế hoạch bữa ăn (UPDATE) - ĐÃ SỬA để populate sau khi cập nhật
exports.updateMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const mealPlanToUpdate = await MealPlan.findById(id);
        if (!mealPlanToUpdate) {
            return res.status(404).json({ message: 'Kế hoạch bữa ăn không tìm thấy.' });
        }

        if (mealPlanToUpdate.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật kế hoạch bữa ăn này.' });
        }

        if (updates.recipes && Array.isArray(updates.recipes)) {
            if (updates.recipes.length === 0) {
                return res.status(400).json({ message: 'Kế hoạch bữa ăn phải có ít nhất một công thức.' });
            }
            for (const recipeId of updates.recipes) {
                if (!mongoose.Types.ObjectId.isValid(recipeId)) {
                    return res.status(400).json({ message: `ID công thức không hợp lệ: ${recipeId}` });
                }
                const existingRecipe = await Recipe.findById(recipeId);
                if (!existingRecipe) {
                    return res.status(404).json({ message: `Không tìm thấy công thức với ID: ${recipeId}.` });
                }
            }
        }

        // Thực hiện cập nhật
        let updatedMealPlan = await MealPlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        // Sau khi cập nhật, populate lại để có tên công thức
        updatedMealPlan = await MealPlan.findById(updatedMealPlan._id)
            .populate({
                path: 'recipes',
                select: 'title'
            })
            .populate('ownedBy', 'username fullName'); // Nếu bạn cũng muốn populate ownedBy

        res.status(200).json(updatedMealPlan); // Trả về đối tượng đã được populate
    } catch (error) {
        console.error('Lỗi khi cập nhật kế hoạch bữa ăn:', error);
        if (error.name === 'ValidationError') {
            let errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID kế hoạch bữa ăn không hợp lệ.' });
        }
        res.status(500).json({ message: 'Lỗi server nội bộ khi cập nhật kế hoạch bữa ăn.' });
    }
};

// 5. Xóa kế hoạch bữa ăn (DELETE) - KHÔNG ĐỔI
exports.deleteMealPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const mealPlanToDelete = await MealPlan.findById(id);
        if (!mealPlanToDelete) {
            return res.status(404).json({ message: 'Kế hoạch bữa ăn không tìm thấy.' });
        }

        if (mealPlanToDelete.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa kế hoạch bữa ăn này.' });
        }

        await MealPlan.findByIdAndDelete(id);
        res.status(200).json({ message: 'Kế hoạch bữa ăn đã được xóa thành công.' });
    } catch (error) {
        console.error('Lỗi khi xóa kế hoạch bữa ăn:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID kế hoạch bữa ăn không hợp lệ.' });
        }
        res.status(500).json({ message: 'Lỗi server nội bộ khi xóa kế hoạch bữa ăn.' });
    }
};

// 6. Gợi ý bữa ăn dựa trên nguyên liệu trong tủ lạnh - KHÔNG ĐỔI
exports.getMealPlanSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;

        const pantryItems = await PantryItem.find({ ownedBy: userId })
            .populate('unit')
            .populate('category');

        const recipes = await Recipe.find({
            $or: [{ ownedBy: userId }, { isPublic: true }]
        })
            .populate('ingredients.unit')
            .populate('ingredients.category');

        const suggestedRecipes = [];

        for (const recipe of recipes) {
            let canMake = true;
            const missingIngredients = [];

            for (const ingredient of recipe.ingredients) {
                const pantryMatch = pantryItems.find(pItem =>
                    pItem.name.toLowerCase() === ingredient.name.toLowerCase() &&
                    pItem.unit._id.equals(ingredient.unit._id)
                );

                if (!pantryMatch || pantryMatch.quantity < ingredient.quantity) {
                    canMake = false;
                    missingIngredients.push({
                        name: ingredient.name,
                        required: ingredient.quantity,
                        have: pantryMatch ? pantryMatch.quantity : 0,
                        unit: ingredient.unit ? ingredient.unit.abbreviation : 'N/A',
                        category: ingredient.category ? ingredient.category.name : 'N/A'
                    });
                }
            }

            if (canMake) {
                suggestedRecipes.push({
                    recipe: recipe,
                    status: 'can_make',
                    missingIngredients: []
                });
            } else if (missingIngredients.length > 0 && missingIngredients.length < recipe.ingredients.length) {
                suggestedRecipes.push({
                    recipe: recipe,
                    status: 'partially_can_make',
                    missingIngredients: missingIngredients
                });
            }
        }

        suggestedRecipes.sort((a, b) => {
            if (a.status === 'can_make' && b.status !== 'can_make') return -1;
            if (a.status !== 'can_make' && b.status === 'can_make') return 1;
            return 0;
        });

        res.status(200).json(suggestedRecipes);
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý kế hoạch bữa ăn:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ: ' + error.message });
    }
};

// 7. Tạo danh sách mua sắm từ Meal Plan - KHÔNG ĐỔI
exports.generateShoppingListFromMealPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const mealPlan = await MealPlan.findById(id)
            .populate({
                path: 'recipes',
                populate: [
                    { path: 'ingredients.unit' },
                    { path: 'ingredients.category' }
                ]
            });

        if (!mealPlan) {
            return res.status(404).json({ message: 'Kế hoạch bữa ăn không tìm thấy.' });
        }

        if (mealPlan.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền tạo danh sách mua sắm từ kế hoạch bữa ăn này.' });
        }

        let shoppingListItems = [];
        let ingredientMap = new Map();

        for (const recipe of mealPlan.recipes) {
            if (recipe && recipe.ingredients) {
                for (const ingredient of recipe.ingredients) {
                    const key = `${ingredient.name.toLowerCase()}-${ingredient.unit._id.toString()}-${ingredient.category._id.toString()}`;

                    const currentData = ingredientMap.get(key) || {
                        quantity: 0,
                        unit: ingredient.unit,
                        category: ingredient.category,
                        name: ingredient.name
                    };

                    currentData.quantity += ingredient.quantity;
                    ingredientMap.set(key, currentData);
                }
            }
        }

        for (const [key, data] of ingredientMap.entries()) {
            shoppingListItems.push({
                name: data.name,
                category: data.category._id,
                quantity: data.quantity,
                unit: data.unit._id,
                status: 'PENDING'
            });
        }

        let shoppingListStartDate = mealPlan.date;
        let shoppingListEndDate = mealPlan.date;

        if (mealPlan.type === 'WEEKLY') {
            const d = new Date(mealPlan.date);
            const dayOfWeek = d.getDay();

            shoppingListStartDate = new Date(d);
            shoppingListStartDate.setDate(d.getDate() - dayOfWeek);

            shoppingListEndDate = new Date(shoppingListStartDate);
            shoppingListEndDate.setDate(shoppingListStartDate.getDate() + 6);
        }

        const newShoppingList = new ShoppingList({
            name: `DS Mua Sắm cho ${mealPlan.title}` + (mealPlan.type === 'DAILY' ? ` (${new Date(mealPlan.date).toLocaleDateString()})` : ` (${new Date(shoppingListStartDate).toLocaleDateString()} - ${new Date(shoppingListEndDate).toLocaleDateString()})`),
            startDate: shoppingListStartDate,
            endDate: shoppingListEndDate,
            items: shoppingListItems,
            ownedBy: req.user.id
        });

        const savedShoppingList = await newShoppingList.save();

        res.status(201).json({
            message: 'Danh sách mua sắm đã được tạo từ kế hoạch bữa ăn.',
            shoppingList: savedShoppingList
        });

    } catch (error) {
        console.error('Lỗi khi tạo danh sách mua sắm từ kế hoạch bữa ăn:', error);
        res.status(500).json({ message: error.message || 'Lỗi khi tạo danh sách mua sắm từ kế hoạch bữa ăn.' });
    }
};