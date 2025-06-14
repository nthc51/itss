// controllers/unitController.js
const { Unit } = require('../models/models');

exports.createUnit = async (req, res) => {
    try {
        const { name, abbreviation } = req.body;
        const newUnit = new Unit({ name, abbreviation });
        const savedUnit = await newUnit.save();
        res.status(201).json(savedUnit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        res.status(200).json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        res.status(200).json(unit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUnit = async (req, res) => {
    try {
        const updatedUnit = await Unit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUnit) return res.status(404).json({ message: 'Unit not found' });
        res.status(200).json(updatedUnit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUnit = async (req, res) => {
    try {
        const deletedUnit = await Unit.findByIdAndDelete(req.params.id);
        if (!deletedUnit) return res.status(404).json({ message: 'Unit not found' });
        res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};