import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Plane, ArrowRight, ShieldCheck, Clock, Luggage, Coffee, CheckCircle } from 'lucide-react';
import flightService from '../services/flightService';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingSummary from '../components/BookingSummary';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDuration = (mins) => {
  if (!mins) return 'Direct';
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hrs}h ${remaining}m`;
};

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const data = await flightService.getFlightById(id);
        setFlight(data);
      } catch (err) {
        setError(err.message || 'Failed to load flight itinerary');
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching detailed flight specifications..." />;
  }

  if (error || !flight) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>Unable to Load Flight</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>{error || 'Flight not found.'}</p>
        <button onClick={() => navigate('/flights')} className="btn btn-primary">
          Back to Flight Search
        </button>
      </div>
    );
  }

  const handleProceed = () => {
    navigate(`/booking/passengers?flightId=${flight.flight_id}&passengers=${passengerCount}`);
  };

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '12px' }}
        >
          &larr; Back to Results
        </button>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
          Flight Itinerary & Fare Breakdown
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review itinerary details and fare inclusions before entering passenger information.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.2fr',
        gap: '28px',
        alignItems: 'flex-start'
      }} className="booking-flow-grid">
        {/* Left Column: Itinerary Specs */}
        <div>
          {/* Main Flight Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <div>
                <span className="badge badge-sky" style={{ marginBottom: '4px' }}>{flight.airline_name}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Flight {flight.flight_number}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">Operated Directly</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Economy Class
                </div>
              </div>
            </div>

            {/* Travel Date */}
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
              Date: {formatDate(flight.departure_time)}
            </div>

            {/* Schedule Segment */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {formatTime(flight.departure_time)}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {flight.origin_city} ({flight.origin_code})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {flight.origin_name}
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '140px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {formatDuration(flight.duration_minutes)}
                </div>
                <div className="duration-line" style={{ margin: '8px 0' }}>
                  <Plane size={14} color="var(--sky-blue)" style={{ transform: 'rotate(90deg)' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-green)', fontWeight: 600 }}>
                  Non-Stop
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {formatTime(flight.arrival_time)}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {flight.destination_city} ({flight.destination_code})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {flight.destination_name}
                </div>
              </div>
            </div>

            {/* Inclusions & Baggage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Luggage size={20} color="var(--sky-blue)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Cabin Baggage:</strong> 7 kg
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Luggage size={20} color="var(--sky-blue)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Check-in Baggage:</strong> 15 kg
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Coffee size={20} color="var(--sky-blue)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Meal:</strong> Available for purchase
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--success-green)" /> Cancellation & Refund Rules
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Cancellations initiated at least 2 hours before departure qualify for an <strong>85% refund</strong> of the total fare. The refund is calculated automatically on the server and returned to the original payment source.
            </p>
          </div>
        </div>

        {/* Right Column: Fare Breakdown & Action */}
        <div>
          <BookingSummary flight={flight} passengerCount={passengerCount} />

          <button
            onClick={handleProceed}
            className="btn btn-accent btn-lg btn-full"
            style={{ marginTop: '20px' }}
          >
            Continue to Passenger Details <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
