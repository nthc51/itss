// routes/unitRoutes.js
const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/authMiddleware'); // Áp dụng bảo vệ

router.use(authMiddleware.protect);

router.post('/', unitController.createUnit);
router.get('/', unitController.getUnits);
router.get('/:id', unitController.getUnitById);
router.put('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;