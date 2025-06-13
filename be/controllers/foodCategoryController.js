// controllers/foodCategoryController.js
const { FoodCategory } = require('../models/models');

exports.createFoodCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new FoodCategory({ name });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFoodCategories = async (req, res) => {
    try {
        const categories = await FoodCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFoodCategoryById = async (req, res) => {
    try {
        const category = await FoodCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Food category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFoodCategory = async (req, res) => {
    try {
        const updatedCategory = await FoodCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCategory) return res.status(404).json({ message: 'Food category not found' });
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFoodCategory = async (req, res) => {
    try {
        const deletedCategory = await FoodCategory.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ message: 'Food category not found' });
        res.status(200).json({ message: 'Food category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};