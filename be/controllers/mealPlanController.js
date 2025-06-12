// controllers/mealPlanController.js
const { MealPlan, User, Recipe, PantryItem, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// 1. Tạo kế hoạch bữa ăn mới (CREATE)
exports.createMealPlan = async (req, res) => {
    try {
        const { date, type, recipes, createdBy } = req.body;

        // Trong một ứng dụng thực tế với JWT, createdBy nên được lấy từ req.user.id sau khi xác thực
        // const createdByUserId = req.user.id;
        // Kiểm tra xem người tạo (createdBy) có tồn tại không
        const existingUser = await User.findById(createdBy); // Tạm thời dùng createdBy từ body
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Kiểm tra các recipe ID có hợp lệ không
        if (recipes && recipes.length > 0) {
            const existingRecipes = await Recipe.find({ _id: { $in: recipes } });
            if (existingRecipes.length !== recipes.length) {
                return res.status(400).json({ message: 'One or more recipe IDs are invalid.' });
            }
        }

        const newMealPlan = new MealPlan({ date, type, recipes, createdBy });
        const savedMealPlan = await newMealPlan.save();
        res.status(201).json(savedMealPlan);
    } catch (error) {
        console.error('Error creating meal plan:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo kế hoạch bữa ăn.' });
    }
};

// 2. Lấy tất cả kế hoạch bữa ăn (READ ALL)
exports.getMealPlans = async (req, res) => {
    try {
        // Lấy userId từ query hoặc từ thông tin người dùng đã xác thực (req.user.id)
        const userId = req.user ? req.user.id : req.query.userId;
        let query = {};
        if (userId) {
            query.createdBy = userId;
        }

        const mealPlans = await MealPlan.find(query)
            .populate('createdBy', 'username fullName') // Populate thông tin người tạo
            .populate('recipes', 'title'); // Populate thông tin các công thức (chỉ lấy title)

        res.status(200).json(mealPlans);
    } catch (error) {
        console.error('Error fetching meal plans:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy kế hoạch bữa ăn.' });
    }
};

// 3. Lấy một kế hoạch bữa ăn theo ID (READ ONE)
exports.getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate('createdBy', 'username fullName')
            .populate('recipes', 'title ingredients'); // Populate đầy đủ hơn nếu cần chi tiết công thức

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.status(200).json(mealPlan);
    } catch (error) {
        console.error('Error fetching meal plan by ID:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi lấy kế hoạch bữa ăn theo ID.' });
    }
};


// 4. Cập nhật kế hoạch bữa ăn (UPDATE)
exports.updateMealPlan = async (req, res) => {
    try {
        const updatedMealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // `new: true` trả về tài liệu đã cập nhật, `runValidators` chạy lại validation schema
        )
            .populate('createdBy', 'username fullName')
            .populate('recipes', 'title'); // Populate thông tin các công thức (chỉ lấy title)

        if (!updatedMealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.status(200).json(updatedMealPlan);
    } catch (error) {
        console.error('Error updating meal plan:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi cập nhật kế hoạch bữa ăn.' });
    }
};

// 5. Xóa kế hoạch bữa ăn (DELETE)
exports.deleteMealPlan = async (req, res) => {
    try {
        const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        if (!deletedMealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        res.status(500).json({ message: error.message || 'Lỗi server khi xóa kế hoạch bữa ăn.' });
    }
};

// 6. Gợi ý bữa ăn dựa trên tủ lạnh/nguyên liệu có sẵn
exports.getMealPlanSuggestions = async (req, res) => {
    try {
        // userId có thể đến từ req.query hoặc từ req.user (nếu đã được xác thực qua middleware)
        const userId = req.user ? req.user.id : req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để gợi ý bữa ăn.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userPantryItems = await PantryItem.find({ ownedBy: userId })
            .populate('category', 'name')
            .populate('unit', 'name abbreviation')
            .sort({ expirationDate: 1 });

        // Tạo một Map để dễ dàng tra cứu các mục trong pantry
        const pantryMap = new Map();
        userPantryItems.forEach(item => {
            // Sử dụng key kết hợp để xử lý các item có cùng tên nhưng đơn vị/category khác
            const key = `${item.name.toLowerCase()}_${item.unit.abbreviation.toLowerCase()}_${item.category.name.toLowerCase()}`;
            if (!pantryMap.has(key)) {
                pantryMap.set(key, []);
            }
            // Chỉ thêm các item còn hạn sử dụng
            if (new Date(item.expirationDate) >= today) {
                pantryMap.get(key).push({
                    quantity: item.quantity,
                    expirationDate: item.expirationDate,
                    _id: item._id
                });
            }
        });

        const allRecipes = await Recipe.find()
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');

        const suggestedRecipes = [];

        for (const recipe of allRecipes) {
            let canMake = true;
            const missingIngredients = [];

            for (const ingredient of recipe.ingredients) {
                const key = `${ingredient.name.toLowerCase()}_${ingredient.unit.abbreviation.toLowerCase()}_${ingredient.category.name.toLowerCase()}`;
                let requiredQuantity = ingredient.quantity;
                const matchingPantryItems = pantryMap.get(key) || [];

                // Giảm số lượng yêu cầu bằng cách sử dụng các mục trong pantry còn hạn
                for (const pantryItem of matchingPantryItems) {
                    if (requiredQuantity <= 0) break; // Đã đủ nguyên liệu này
                    if (new Date(pantryItem.expirationDate) >= today) {
                        const quantityToUse = Math.min(requiredQuantity, pantryItem.quantity);
                        requiredQuantity -= quantityToUse;
                    }
                }

                if (requiredQuantity > 0) {
                    canMake = false;
                    missingIngredients.push({
                        name: ingredient.name,
                        needed: requiredQuantity,
                        unit: ingredient.unit ? ingredient.unit.abbreviation : 'N/A', // Đảm bảo xử lý nếu unit không tồn tại
                        category: ingredient.category ? ingredient.category.name : 'N/A' // Đảm bảo xử lý nếu category không tồn tại
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
                // Gợi ý công thức nếu chỉ thiếu một phần nguyên liệu
                suggestedRecipes.push({
                    recipe: recipe,
                    status: 'partially_can_make',
                    missingIngredients: missingIngredients
                });
            }
            // Không thêm công thức nếu thiếu quá nhiều hoặc không có gì
        }

        // Sắp xếp: ưu tiên công thức có thể làm được hoàn toàn
        suggestedRecipes.sort((a, b) => {
            if (a.status === 'can_make' && b.status !== 'can_make') return -1;
            if (a.status !== 'can_make' && b.status === 'can_make') return 1;
            // Có thể thêm tiêu chí sắp xếp khác cho 'partially_can_make' (ví dụ: thiếu ít nguyên liệu hơn)
            return 0;
        });

        res.status(200).json(suggestedRecipes);
    } catch (error) {
        console.error('Error fetching meal plan suggestions:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};