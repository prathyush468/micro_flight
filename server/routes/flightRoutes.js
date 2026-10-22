const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', flightController.searchFlights);
router.get('/:id', flightController.getFlightById);
router.post('/', verifyToken, requireAdmin, flightController.createFlight);
router.put('/:id', verifyToken, requireAdmin, flightController.updateFlight);
router.patch('/:id/status', verifyToken, requireAdmin, flightController.updateFlightStatus);

module.exports = router;
