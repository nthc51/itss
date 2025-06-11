// routes/shoppingListRoutes.js
const express = require('express');
const router = express.Router(); // Khoi tao mot Express Router
const { ShoppingList, User, FoodCategory, Unit } = require('../models/models'); // Import cac model can thiet

// Tat ca cac route lien quan den ShoppingList
// Luu y: khong can /api/shoppinglists o day nua, chi can '/'

// 1. Tao danh sach mua sam moi (CREATE)
router.post('/', async (req, res) => {
    try {
        const { title, startDate, endDate, items, createdBy, sharedWithGroup } = req.body;
        const existingUser = await User.findById(createdBy);
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found.' });
        }
        const newShoppingList = new ShoppingList({ title, startDate, endDate, items, createdBy, sharedWithGroup });
        const savedList = await newShoppingList.save();
        res.status(201).json(savedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Lay tat ca danh sach mua sam hoac theo user (READ)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.createdBy = userId;
        }
        const shoppingLists = await ShoppingList.find(query)
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        res.status(200).json(shoppingLists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Lay mot danh sach mua sam theo ID (READ)
router.get('/:id', async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id)
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        if (!shoppingList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json(shoppingList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Cap nhat danh sach mua sam (UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const updatedList = await ShoppingList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'username fullName')
            .populate('items.category', 'name')
            .populate('items.unit', 'name abbreviation');
        if (!updatedList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json(updatedList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Xoa danh sach mua sam (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedList = await ShoppingList.findByIdAndDelete(req.params.id);
        if (!deletedList) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }
        res.status(200).json({ message: 'Shopping list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; // Export router