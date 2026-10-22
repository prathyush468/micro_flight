const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, bookingController.createBooking);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.get('/:id', verifyToken, bookingController.getBookingDetails);
router.post('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Alias simulated payment route per prompt specification
router.post('/:id/payment', verifyToken, (req, res) => {
  return res.json({
    success: true,
    message: 'Simulated payment verified. Ticket updated.',
    transactionId: req.body.transactionReference || 'TXN-MOCK-SUCCESS'
  });
});

module.exports = router;
