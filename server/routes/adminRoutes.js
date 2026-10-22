const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin endpoints with authentication and admin role enforcement
router.use(verifyToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/bookings', adminController.getAllBookings);
router.get('/users', adminController.getAllUsers);
router.post('/airports', adminController.createAirport);
router.put('/airports/:id', adminController.updateAirport);

module.exports = router;
