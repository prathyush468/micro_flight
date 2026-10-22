const Flight = require('../models/Flight');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Search Flights based on route, date, passengers, and filters
 */
const searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      passengers = 1,
      airline,
      minPrice,
      maxPrice,
      sortBy = 'base_fare',
      sortOrder = 'ASC'
    } = req.query;

    if (origin && destination && origin.toUpperCase() === destination.toUpperCase()) {
      return sendError(res, 'Origin and Destination airports must be different', 400);
    }

    const flights = await Flight.search({
      originCode: origin,
      destCode: destination,
      departureDate,
      passengerCount: parseInt(passengers, 10) || 1,
      airline,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder
    });

    return sendSuccess(res, flights, `Found ${flights.length} available flight(s)`);
  } catch (error) {
    console.error('[FlightController.searchFlights] Error:', error);
    return sendError(res, 'Failed to perform flight search', 500);
  }
};

/**
 * Get Flight details by ID including taxes and fare breakdown
 */
const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await Flight.findById(id);

    if (!flight) {
      return sendError(res, 'Flight not found', 404);
    }

    // Dynamic fare breakdown calculation (Server-side single source of truth)
    const baseFare = Number(flight.base_fare);
    const aviationGst = Math.round(baseFare * 0.05 * 100) / 100; // 5% GST
    const airportFee = Math.round(baseFare * 0.07 * 100) / 100;  // 7% Airport Development Fee
    const totalFarePerPassenger = baseFare + aviationGst + airportFee;

    const flightWithBreakdown = {
      ...flight,
      fareBreakdown: {
        baseFare,
        aviationGst,
        airportFee,
        totalFarePerPassenger
      }
    };

    return sendSuccess(res, flightWithBreakdown, 'Flight details retrieved');
  } catch (error) {
    console.error('[FlightController.getFlightById] Error:', error);
    return sendError(res, 'Failed to fetch flight details', 500);
  }
};

/**
 * Admin: Create a new flight schedule
 */
const createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airlineName,
      originAirportId,
      destinationAirportId,
      departureTime,
      arrivalTime,
      baseFare,
      totalSeats
    } = req.body;

    // Business Rules Validation
    if (
      !flightNumber ||
      !airlineName ||
      !originAirportId ||
      !destinationAirportId ||
      !departureTime ||
      !arrivalTime ||
      !baseFare ||
      !totalSeats
    ) {
      return sendError(res, 'All flight schedule fields are required', 400);
    }

    if (parseInt(originAirportId, 10) === parseInt(destinationAirportId, 10)) {
      return sendError(res, 'Origin and Destination airports cannot be identical', 400);
    }

    const depDate = new Date(departureTime);
    const arrDate = new Date(arrivalTime);

    if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) {
      return sendError(res, 'Invalid departure or arrival timestamp format', 400);
    }

    if (arrDate <= depDate) {
      return sendError(res, 'Arrival time must be strictly after departure time', 400);
    }

    if (parseFloat(baseFare) <= 0) {
      return sendError(res, 'Base fare must be a positive amount', 400);
    }

    if (parseInt(totalSeats, 10) <= 0) {
      return sendError(res, 'Total seat count must be greater than zero', 400);
    }

    const flightId = await Flight.create({
      flightNumber,
      airlineName,
      originAirportId: parseInt(originAirportId, 10),
      destinationAirportId: parseInt(destinationAirportId, 10),
      departureTime,
      arrivalTime,
      baseFare: parseFloat(baseFare),
      totalSeats: parseInt(totalSeats, 10)
    });

    const createdFlight = await Flight.findById(flightId);
    return sendSuccess(res, createdFlight, 'Flight created and scheduled successfully', 201);
  } catch (error) {
    console.error('[FlightController.createFlight] Error:', error);
    return sendError(res, 'Failed to create flight record', 500);
  }
};

/**
 * Admin: Update flight details
 */
const updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Flight.findById(id);

    if (!existing) {
      return sendError(res, 'Flight not found', 404);
    }

    const updated = await Flight.update(id, req.body);
    if (!updated) {
      return sendError(res, 'No changes applied or invalid fields provided', 400);
    }

    const updatedFlight = await Flight.findById(id);
    return sendSuccess(res, updatedFlight, 'Flight updated successfully');
  } catch (error) {
    console.error('[FlightController.updateFlight] Error:', error);
    return sendError(res, 'Failed to update flight', 500);
  }
};

/**
 * Admin: Update flight operational status
 */
const updateFlightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled', 'inactive'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const existing = await Flight.findById(id);
    if (!existing) {
      return sendError(res, 'Flight not found', 404);
    }

    await Flight.updateStatus(id, status);
    const updated = await Flight.findById(id);

    return sendSuccess(res, updated, `Flight status updated to ${status}`);
  } catch (error) {
    console.error('[FlightController.updateFlightStatus] Error:', error);
    return sendError(res, 'Failed to update flight status', 500);
  }
};

module.exports = {
  searchFlights,
  getFlightById,
  createFlight,
  updateFlight,
  updateFlightStatus
};
