// controllers/mealPlanController.js
const { MealPlan, User, Recipe, PantryItem, FoodCategory, Unit } = require('../models/models'); // Import các model cần thiết

// 1. Tạo kế hoạch bữa ăn mới (CREATE)
exports.createMealPlan = async (req, res) => {
    try {
        const { name, startDate, endDate, planType, meals } = req.body;

        // DEBUG LOG: Kiểm tra req.user và req.user.id TRONG MEALPLAN CONTROLLER
        console.log("DEBUG MEALPLAN: req.user:", req.user);
        console.log("DEBUG MEALPLAN: req.user.id:", req.user ? req.user.id : "No user ID");

        // Kiểm tra xem req.user có tồn tại không (được cung cấp bởi authMiddleware.protect)
        if (!req.user || !req.user.id) {
            console.error("Lỗi MealPlan: Người dùng không xác thực hoặc thiếu ID người dùng.");
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }

        // Tạo một Meal Plan mới
        const newMealPlan = new MealPlan({
            name,
            startDate,
            endDate,
            planType,
            meals,
            ownedBy: req.user.id // Gán meal plan cho người dùng hiện tại
        });

        // DEBUG LOG: Kiểm tra đối tượng MealPlan trước khi lưu
        console.log("DEBUG MEALPLAN: newMealPlan before save:", newMealPlan);

        const savedMealPlan = await newMealPlan.save();

        res.status(201).json(savedMealPlan);
    } catch (error) {
        // DEBUG LOG: Ghi lại TOÀN BỘ đối tượng lỗi cho MealPlan
        console.error("Error creating meal plan:", error);
        // Cải thiện thông báo lỗi nếu là lỗi xác thực Mongoose
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Lỗi xác thực dữ liệu', errors });
        }
        res.status(500).json({ message: error.message || 'Lỗi server khi tạo kế hoạch bữa ăn.' });
    }
};

// 2. Lấy tất cả kế hoạch bữa ăn (READ ALL)
exports.getMealPlans = async (req, res) => {
    try {
        // Lấy userId từ thông tin người dùng đã xác thực (req.user.id)
        // Đây là cách tốt nhất, không cần req.query.userId nếu middleware đã bảo vệ route
        const userId = req.user.id;

        // Lọc các meal plan thuộc sở hữu của người dùng hiện tại
        const mealPlans = await MealPlan.find({ ownedBy: userId }) // <-- THAY ĐỔI Ở ĐÂY: Lọc theo ownedBy
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate thông tin người tạo từ ownedBy
            .populate('meals.recipe', 'title'); // Populate thông tin các công thức (chỉ lấy title)

        // Chú ý: nếu bạn có nhiều trường trong "meals", ví dụ meals: [{ day: String, type: String, recipe: ObjectId }]
        // thì cần populate 'meals.recipe' chứ không phải 'recipes'. Tôi giả định 'meals' là một mảng object với trường 'recipe'.

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
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate ownedBy
            .populate('meals.recipe', 'title ingredients'); // Populate đầy đủ hơn nếu cần chi tiết công thức

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xem chi tiết
        if (mealPlan.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập kế hoạch bữa ăn này.' });
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
        // Tìm kế hoạch bữa ăn trước để kiểm tra quyền sở hữu
        const mealPlanToUpdate = await MealPlan.findById(req.params.id);
        if (!mealPlanToUpdate) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể cập nhật
        if (mealPlanToUpdate.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật kế hoạch bữa ăn này.' });
        }

        const updatedMealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('ownedBy', 'username fullName') // <-- THAY ĐỔI Ở ĐÂY: Populate ownedBy
            .populate('meals.recipe', 'title');

        if (!updatedMealPlan) {
            return res.status(404).json({ message: 'Meal plan not found after update attempt.' });
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
        // Tìm kế hoạch bữa ăn trước để kiểm tra quyền sở hữu
        const mealPlanToDelete = await MealPlan.findById(req.params.id);
        if (!mealPlanToDelete) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // KIỂM TRA QUYỀN SỞ HỮU: Chỉ chủ sở hữu mới có thể xóa
        if (mealPlanToDelete.ownedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xóa kế hoạch bữa ăn này.' });
        }

        const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        if (!deletedMealPlan) { // Kiểm tra lại, mặc dù đã kiểm tra ở trên
            return res.status(404).json({ message: 'Meal plan not found after delete attempt.' });
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
        const userId = req.user.id; // Lấy ID từ người dùng đã xác thực

        if (!userId) {
            return res.status(400).json({ message: 'User ID là bắt buộc để gợi ý bữa ăn.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Lấy các mục trong tủ lạnh của người dùng hiện tại
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

        // Lấy TẤT CẢ các công thức. Nếu công thức là private, bạn có thể muốn lọc theo ownedBy: userId
        // Hoặc nếu có trường isPublic, bạn có thể lọc theo { $or: [{ ownedBy: userId }, { isPublic: true }] }
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
        }

        // Sắp xếp: ưu tiên công thức có thể làm được hoàn toàn
        suggestedRecipes.sort((a, b) => {
            if (a.status === 'can_make' && b.status !== 'can_make') return -1;
            if (a.status !== 'can_make' && b.status === 'can_make') return 1;
            return 0;
        });

        res.status(200).json(suggestedRecipes);
    } catch (error) {
        console.error('Error fetching meal plan suggestions:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};