const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController');

router.get('/', airportController.getAllAirports);
router.get('/:id', airportController.getAirportById);

module.exports = router;
