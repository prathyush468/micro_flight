const Airport = require('../models/Airport');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.findAll(true);
    return sendSuccess(res, airports, 'Airports retrieved successfully');
  } catch (error) {
    console.error('[AirportController.getAllAirports] Error:', error);
    return sendError(res, 'Failed to fetch airports list', 500);
  }
};

const getAirportById = async (req, res) => {
  try {
    const { id } = req.params;
    const airport = await Airport.findById(id);
    if (!airport) {
      return sendError(res, 'Airport not found', 404);
    }
    return sendSuccess(res, airport, 'Airport retrieved successfully');
  } catch (error) {
    console.error('[AirportController.getAirportById] Error:', error);
    return sendError(res, 'Failed to fetch airport', 500);
  }
};

module.exports = {
  getAllAirports,
  getAirportById
};
