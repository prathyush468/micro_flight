import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, QrCode, Building, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import flightService from '../services/flightService';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingSummary from '../components/BookingSummary';
import FormInput from '../components/FormInput';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flightId = searchParams.get('flightId');

  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loadingFlight, setLoadingFlight] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4532 •••• •••• 8890',
    cardName: 'DEMO PASSENGER',
    expiry: '12/28',
    cvv: '•••'
  });
  const [upiId, setUpiId] = useState('passenger@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    // Retrieve stored passengers
    const stored = sessionStorage.getItem('skybook_booking_passengers');
    if (!stored || !flightId) {
      navigate('/flights');
      return;
    }

    try {
      setPassengers(JSON.parse(stored));
    } catch (e) {
      navigate('/flights');
      return;
    }

    const fetchFlight = async () => {
      try {
        const data = await flightService.getFlightById(flightId);
        setFlight(data);
      } catch (err) {
        setError('Failed to fetch flight itinerary');
      } finally {
        setLoadingFlight(false);
      }
    };
    fetchFlight();
  }, [flightId, navigate]);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Dispatch transactional reservation to Express API
      const bookingResponse = await bookingService.createBooking({
        flightId: parseInt(flightId, 10),
        passengers,
        paymentMethod,
        tripType: 'one-way'
      });

      // Clear draft storage
      sessionStorage.removeItem('skybook_booking_passengers');

      // Navigate to confirmation page with generated PNR
      navigate(`/booking/confirmation/${bookingResponse.pnr}`);
    } catch (err) {
      setError(err.message || 'Payment simulation failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loadingFlight) {
    return <LoadingSpinner fullPage message="Securing reservation gateway..." />;
  }

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
          Simulated Payment Gateway
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Select your simulated payment method to finalize ticket reservation.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.2fr',
        gap: '28px',
        alignItems: 'flex-start'
      }} className="booking-flow-grid">
        {/* Left Column: Payment Form */}
        <div>
          {error && (
            <div style={{
              backgroundColor: 'var(--danger-red-light)',
              color: 'var(--danger-red)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Academic Simulation Notice */}
          <div style={{
            backgroundColor: 'var(--sky-blue-subtle)',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Lock size={20} color="var(--sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                Academic Demonstration Environment
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '2px' }}>
                This is a simulated transaction. Real debit/credit card numbers or UPI PINs are never requested or stored. Clicking "Authorize Payment" simulates an instant 200 OK payment callback.
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '16px' }}>
              Choose Payment Method
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              >
                <CreditCard size={20} />
                <span style={{ fontSize: '0.85rem' }}>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              >
                <QrCode size={20} />
                <span style={{ fontSize: '0.85rem' }}>UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`btn ${paymentMethod === 'netbanking' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              >
                <Building size={20} />
                <span style={{ fontSize: '0.85rem' }}>Net Banking</span>
              </button>
            </div>

            {/* Simulated Method Details */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormInput
                  label="Simulated Card Number"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  placeholder="4532 0000 0000 0000"
                  icon={CreditCard}
                  disabled
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormInput
                    label="Valid Thru"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    placeholder="MM/YY"
                    disabled
                  />
                  <FormInput
                    label="CVV"
                    name="cvv"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    placeholder="123"
                    disabled
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormInput
                  label="Simulated UPI Virtual ID"
                  name="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi"
                  icon={QrCode}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="form-group">
                <label className="form-label">
                  <Building size={16} color="var(--sky-blue)" />
                  Select Partner Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="form-control"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              disabled={processing}
            >
              Cancel & Return
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="btn btn-accent btn-lg"
              style={{ flex: 1 }}
            >
              {processing ? (
                <span>Reserving Seats in MySQL...</span>
              ) : (
                <span>Authorize & Confirm Booking</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Booking Summary */}
        <div>
          <BookingSummary flight={flight} passengerCount={passengers.length} />
        </div>
      </div>
    </div>
  );
};

export default Payment;
