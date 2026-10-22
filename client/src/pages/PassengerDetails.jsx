import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Calendar, ArrowRight, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import flightService from '../services/flightService';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingSummary from '../components/BookingSummary';
import FormInput from '../components/FormInput';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const flightId = searchParams.get('flightId');
  const countParam = parseInt(searchParams.get('passengers') || '1', 10);

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dynamic passengers state array
  const [passengers, setPassengers] = useState(() => {
    return Array.from({ length: Math.max(1, countParam) }, (_, idx) => ({
      fullName: idx === 0 && user ? user.fullName : '',
      dateOfBirth: '',
      gender: 'male',
      passengerType: 'adult'
    }));
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!flightId) {
      navigate('/flights');
      return;
    }

    const fetchFlight = async () => {
      try {
        const data = await flightService.getFlightById(flightId);
        setFlight(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve flight details');
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [flightId, navigate]);

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear validation error for that field
    if (validationErrors[`${index}-${field}`]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[`${index}-${field}`];
        return updated;
      });
    }
  };

  const handleAddPassenger = () => {
    if (passengers.length < 9) {
      setPassengers((prev) => [
        ...prev,
        { fullName: '', dateOfBirth: '', gender: 'male', passengerType: 'adult' }
      ]);
    }
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    passengers.forEach((p, idx) => {
      if (!p.fullName || p.fullName.trim().length < 2) {
        errors[`${idx}-fullName`] = 'Full name is required (min 2 characters)';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      // Store draft in sessionStorage so it isn't lost upon login
      sessionStorage.setItem('skybook_draft_passengers', JSON.stringify(passengers));
      sessionStorage.setItem('skybook_draft_flightId', flightId);
      navigate('/login', {
        state: { from: { pathname: `/booking/passengers?flightId=${flightId}&passengers=${passengers.length}` } }
      });
      return;
    }

    // Pass data forward to payment step
    sessionStorage.setItem('skybook_booking_passengers', JSON.stringify(passengers));
    navigate(`/booking/payment?flightId=${flightId}`);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Configuring passenger forms..." />;
  }

  if (error || !flight) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>Flight Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>{error || 'Flight not found.'}</p>
        <button onClick={() => navigate('/flights')} className="btn btn-primary">
          Select Another Flight
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
          Passenger Information
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Please enter full legal names as they appear on government-issued travel IDs.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.2fr',
        gap: '28px',
        alignItems: 'flex-start'
      }} className="booking-flow-grid">
        {/* Left Column: Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {passengers.map((p, idx) => (
              <div key={idx} className="card" style={{ marginBottom: '20px', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    <span className="badge badge-sky" style={{ borderRadius: '50%', width: '24px', height: '24px', padding: 0, justifyContent: 'center' }}>
                      {idx + 1}
                    </span>
                    <span>Passenger {idx + 1}</span>
                  </div>

                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      style={{ color: 'var(--danger-red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <FormInput
                    label="Full Name (as per ID)"
                    name={`fullName-${idx}`}
                    value={p.fullName}
                    onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                    placeholder="e.g., Alexander Fleming"
                    icon={User}
                    error={validationErrors[`${idx}-fullName`]}
                    required
                  />

                  <div className="form-group">
                    <label className="form-label">Passenger Type</label>
                    <select
                      value={p.passengerType}
                      onChange={(e) => handlePassengerChange(idx, 'passengerType', e.target.value)}
                      className="form-control"
                    >
                      <option value="adult">Adult (12+ yrs)</option>
                      <option value="child">Child (2-11 yrs)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      value={p.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                      className="form-control"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={16} color="var(--sky-blue)" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={p.dateOfBirth}
                      onChange={(e) => handlePassengerChange(idx, 'dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            ))}

            {passengers.length < 9 && (
              <button
                type="button"
                onClick={handleAddPassenger}
                className="btn btn-outline btn-full"
                style={{ marginBottom: '24px', borderStyle: 'dashed' }}
              >
                <Plus size={16} /> Add Another Passenger
              </button>
            )}

            <button type="submit" className="btn btn-accent btn-lg btn-full">
              Proceed to Simulated Payment <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Column: Sticky Summary */}
        <div>
          <BookingSummary flight={flight} passengerCount={passengers.length} />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
