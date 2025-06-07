// routes/mealPlanRoutes.js
const express = require('express');
const router = express.Router();
const { MealPlan, User, Recipe, PantryItem, FoodCategory, Unit } = require('../models/models');

// Tat ca cac route lien quan den MealPlan

// 1. Tao ke hoach bua an (CREATE)
router.post('/', async (req, res) => {
    try {
        const { date, type, recipes, createdBy } = req.body;
        const existingUser = await User.findById(createdBy);
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }
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
        res.status(500).json({ message: error.message });
    }
});

// 2. Lay ke hoach bua an (READ)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.createdBy = userId;
        }
        const mealPlans = await MealPlan.find(query)
            .populate('createdBy', 'username fullName')
            .populate('recipes', 'title');
        res.status(200).json(mealPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Cap nhat ke hoach bua an (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const updatedMealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'username fullName')
            .populate('recipes', 'title');
        if (!updatedMealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.status(200).json(updatedMealPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Xoa ke hoach bua an (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        if (!deletedMealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- GOI Y BUA AN DUA TREN THUC PHAM CO SAN ---

// GET /suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required for meal plan suggestions.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userPantryItems = await PantryItem.find({ ownedBy: userId })
            .populate('category', 'name')
            .populate('unit', 'name abbreviation')
            .sort({ expirationDate: 1 });

        const pantryMap = new Map();
        userPantryItems.forEach(item => {
            const key = `${item.name.toLowerCase()}_${item.unit.abbreviation.toLowerCase()}_${item.category.name.toLowerCase()}`;
            if (!pantryMap.has(key)) {
                pantryMap.set(key, []);
            }
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

                for (const pantryItem of matchingPantryItems) {
                    if (requiredQuantity <= 0) break;
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
                        unit: ingredient.unit.abbreviation,
                        category: ingredient.category.name
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
        console.error('Error fetching meal plan suggestions:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

module.exports = router;