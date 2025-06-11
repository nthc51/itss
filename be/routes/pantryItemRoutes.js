// routes/pantryItemRoutes.js
const express = require('express');
const router = express.Router();
const { PantryItem, User, FoodCategory, Unit } = require('../models/models');

// Tat ca cac route lien quan den PantryItem

// 1. Them thuc pham vao tu lanh (CREATE)
router.post('/', async (req, res) => {
    try {
        const { name, quantity, unit, expirationDate, location, category, ownedBy } = req.body;
        const existingUnit = await Unit.findById(unit);
        const existingCategory = await FoodCategory.findById(category);
        const existingUser = await User.findById(ownedBy);
        if (!existingUnit || !existingCategory || !existingUser) {
            return res.status(400).json({ message: 'Invalid Unit, Category, or User ID.' });
        }
        const newPantryItem = new PantryItem({ name, quantity, unit, expirationDate, location, category, ownedBy });
        const savedItem = await newPantryItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Lay tat ca thuc pham trong tu lanh hoac theo nguoi so huu (READ)
router.get('/', async (req, res) => {
    try {
        const { ownedBy } = req.query;
        let query = {};
        if (ownedBy) {
            query.ownedBy = ownedBy;
        }
        const pantryItems = await PantryItem.find(query)
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');
        res.status(200).json(pantryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Cap nhat thong tin thuc pham (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await PantryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('unit', 'name abbreviation')
            .populate('category', 'name')
            .populate('ownedBy', 'username fullName');
        if (!updatedItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Xoa thuc pham khoi tu lanh (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }
        res.status(200).json({ message: 'Pantry item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;