// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const { Recipe, User, FoodCategory, Unit } = require('../models/models');

// Tat ca cac route lien quan den Recipe

// 1. Them cong thuc moi (CREATE)
router.post('/', async (req, res) => {
    try {
        const { title, instructions, servings, ingredients, createdBy } = req.body;
        const existingUser = await User.findById(createdBy);
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }
        const newRecipe = new Recipe({ title, instructions, servings, ingredients, createdBy });
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Lay tat ca cong thuc (READ)
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('createdBy', 'username fullName')
            .populate('ingredients.category', 'name')
            .populate('ingredients.unit', 'name abbreviation');
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Cap nhat cong thuc (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
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
});

// 4. Xoa cong thuc (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;