import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, AlertCircle, CheckCircle2, Luggage, Wifi, Shield } from 'lucide-react';
import { getAirlineInfo } from '../utils/airlineAssets';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
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
  const airlineInfo = getAirlineInfo(flight.airline_name);

  const handleSelectFlight = () => {
    navigate(`/flights/${flight.flight_id}?passengers=${passengerCount}`);
  };

  const isLowSeats = flight.available_seats <= 20;

  return (
    <div className="flight-card-classic">
      {/* 1. Leading Aircraft Image Thumbnail */}
      <div className="aircraft-visual-container">
        <div className="aircraft-image-wrapper">
          <img
            src={airlineInfo.image}
            alt={`${flight.airline_name} Aircraft - ${airlineInfo.aircraftModel}`}
            className="aircraft-image"
            loading="lazy"
          />
          <div
            className="airline-badge-overlay"
            style={{ backgroundColor: airlineInfo.primaryColor }}
          >
            {flight.airline_name}
          </div>
        </div>

        <div className="aircraft-specs-caption">
          <span className="aircraft-model-name">
            <Plane size={12} style={{ transform: 'rotate(45deg)', display: 'inline', marginRight: '4px' }} />
            {airlineInfo.aircraftModel}
          </span>
          <span className="cabin-class-tag">Economy &bull; {airlineInfo.cabinLayout.split(' ')[0]}</span>
        </div>
      </div>

      {/* 2. Center Schedule, Timetable & Route */}
      <div className="flight-timetable-section">
        {/* Carrier Header */}
        <div className="flight-carrier-header">
          <div className="carrier-title">
            <strong>{flight.airline_name}</strong>
            <span className="carrier-flight-no">&bull; {flight.flight_number}</span>
          </div>
          <span className="badge badge-sky" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
            Non-Stop Direct
          </span>
        </div>

        {/* Timetable Segment */}
        <div className="timetable-grid">
          {/* Origin */}
          <div className="time-block time-origin">
            <div className="time-value">{formatTime(flight.departure_time)}</div>
            <div className="station-code">{flight.origin_code}</div>
            <div className="city-name">{flight.origin_city}</div>
            <div className="date-stamp">{formatDate(flight.departure_time)}</div>
          </div>

          {/* Flight Path Graphic */}
          <div className="flight-path-block">
            <div className="duration-label">{formatDuration(flight.duration_minutes)}</div>
            <div className="flight-path-track">
              <span className="track-node start-node"></span>
              <div className="track-line">
                <Plane size={15} className="track-plane-icon" color="var(--sky-blue)" />
              </div>
              <span className="track-node end-node"></span>
            </div>
            <div className="flight-stops-label">Direct Flight</div>
          </div>

          {/* Destination */}
          <div className="time-block time-destination">
            <div className="time-value">{formatTime(flight.arrival_time)}</div>
            <div className="station-code">{flight.destination_code}</div>
            <div className="city-name">{flight.destination_city}</div>
            <div className="date-stamp">{formatDate(flight.arrival_time)}</div>
          </div>
        </div>

        {/* Amenities Row */}
        <div className="flight-amenities-row">
          <span className="amenity-item">
            <Luggage size={13} color="var(--sky-blue)" /> 7kg Cabin Baggage
          </span>
          <span className="amenity-item">
            <Wifi size={13} color="var(--sky-blue)" /> In-flight Refreshments
          </span>
          <span className="amenity-item">
            <Shield size={13} color="var(--success-green)" /> 85% Refund on Cancellation
          </span>
        </div>
      </div>

      {/* 3. Right Pricing & Selection CTA */}
      <div className="flight-pricing-section">
        <div className="price-tag-wrapper">
          <div className="fare-subtext">Base Fare per person</div>
          <div className="fare-figure">
            &#8377;{Number(flight.base_fare).toLocaleString('en-IN')}
          </div>
          <div className="fare-taxes-note">+ Aviation Taxes & Surcharges</div>
        </div>

        {/* Availability status */}
        <div className="seat-inventory-status">
          {isLowSeats ? (
            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
              <AlertCircle size={12} /> Only {flight.available_seats} seats left!
            </span>
          ) : (
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              <CheckCircle2 size={12} /> {flight.available_seats} seats available
            </span>
          )}
        </div>

        <button
          onClick={handleSelectFlight}
          className="btn btn-accent btn-sm btn-select-flight"
          style={{ width: '100%' }}
        >
          Select Flight <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
