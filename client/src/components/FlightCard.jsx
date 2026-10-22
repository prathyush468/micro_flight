import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const formatTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
};

const formatDuration = (minutes) => {
  if (!minutes) return 'Direct';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

const FlightCard = ({ flight, passengerCount = 1 }) => {
  const navigate = useNavigate();

  const handleSelectFlight = () => {
    navigate(`/flights/${flight.flight_id}?passengers=${passengerCount}`);
  };

  const isLowSeats = flight.available_seats <= 20;

  return (
    <div className="flight-card">
      {/* Airline Details */}
      <div className="airline-info">
        <div className="airline-avatar">
          {flight.airline_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="airline-name">{flight.airline_name}</div>
          <div className="flight-number">{flight.flight_number} &bull; Non-Stop</div>
          <div style={{ marginTop: '4px' }}>
            <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>
              Boeing 737 / A320
            </span>
          </div>
        </div>
      </div>

      {/* Flight Schedule Times & Route */}
      <div className="flight-times">
        {/* Origin */}
        <div className="time-city">
          <h4>{formatTime(flight.departure_time)}</h4>
          <p><strong>{flight.origin_code}</strong> ({flight.origin_city})</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {formatDate(flight.departure_time)}
          </span>
        </div>

        {/* Duration Track */}
        <div className="duration-indicator">
          <div className="duration-text">{formatDuration(flight.duration_minutes)}</div>
          <div className="duration-line">
            <Plane size={14} color="var(--sky-blue)" style={{ transform: 'rotate(90deg)' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--success-green)', fontWeight: 600 }}>
            Direct Flight
          </div>
        </div>

        {/* Destination */}
        <div className="time-city">
          <h4>{formatTime(flight.arrival_time)}</h4>
          <p><strong>{flight.destination_code}</strong> ({flight.destination_city})</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {formatDate(flight.arrival_time)}
          </span>
        </div>
      </div>

      {/* Fare & Booking Button */}
      <div className="fare-action">
        <div className="flight-price">
          &#8377;{Number(flight.base_fare).toLocaleString('en-IN')}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}> / person</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          {isLowSeats ? (
            <span className="badge badge-warning">
              <AlertCircle size={12} /> Only {flight.available_seats} seats left!
            </span>
          ) : (
            <span style={{ color: 'var(--success-green)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> {flight.available_seats} seats available
            </span>
          )}
        </div>

        <button onClick={handleSelectFlight} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
          Select Flight <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
