import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, Search, ArrowRightLeft, AlertCircle } from 'lucide-react';
import flightService from '../services/flightService';
import DateSelector from './DateSelector';
import PassengerSelector from './PassengerSelector';

// Initial fallback airports so dropdowns are always populated immediately
const DEFAULT_AIRPORTS = [
  { airport_code: 'COK', airport_name: 'Cochin International Airport', city: 'Kochi' },
  { airport_code: 'BLR', airport_name: 'Kempegowda International Airport', city: 'Bengaluru' },
  { airport_code: 'DEL', airport_name: 'Indira Gandhi International Airport', city: 'New Delhi' },
  { airport_code: 'BOM', airport_name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
  { airport_code: 'HYD', airport_name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
  { airport_code: 'MAA', airport_name: 'Chennai International Airport', city: 'Chennai' },
  { airport_code: 'GOI', airport_name: 'Dabolim Airport', city: 'Goa' },
  { airport_code: 'CCU', airport_name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' }
];

const SearchForm = ({ initialValues = {}, compact = false }) => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState(DEFAULT_AIRPORTS);
  const [loadingAirports, setLoadingAirports] = useState(true);

  // Form State
  const [tripType, setTripType] = useState(initialValues.tripType || 'one-way');
  const [origin, setOrigin] = useState(initialValues.origin || 'COK');
  const [destination, setDestination] = useState(initialValues.destination || 'BLR');
  
  // Default departure date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [departureDate, setDepartureDate] = useState(initialValues.departureDate || defaultDateStr);
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || '');
  const [passengers, setPassengers] = useState({
    adults: parseInt(initialValues.adults || initialValues.passengers || 1, 10),
    childrenCount: parseInt(initialValues.childrenCount || 0, 10)
  });

  const [error, setError] = useState('');

  // Fetch Airports list from API
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const data = await flightService.getAirports();
        if (data && data.length > 0) {
          setAirports(data);
        }
      } catch (err) {
        console.error('Failed to load airports from API, using default airport list', err);
      } finally {
        setLoadingAirports(false);
      }
    };
    fetchAirports();
  }, []);

  // Swap Origin and Destination
  const handleSwapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Business rule: Origin and Destination must differ
    if (!origin || !destination) {
      setError('Please select both Origin and Destination airports');
      return;
    }

    if (origin.toUpperCase() === destination.toUpperCase()) {
      setError('Origin and Destination airports must be different');
      return;
    }

    if (!departureDate) {
      setError('Please select a valid departure date');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      setError('Please select a return date for round-trip journey');
      return;
    }

    const totalPax = passengers.adults + passengers.childrenCount;

    const queryParams = new URLSearchParams({
      origin,
      destination,
      departureDate,
      passengers: totalPax,
      tripType
    });

    if (tripType === 'round-trip' && returnDate) {
      queryParams.append('returnDate', returnDate);
    }

    navigate(`/flights?${queryParams.toString()}`);
  };

  return (
    <div className="search-box-card">
      {/* Trip Type Tabs */}
      <div className="trip-type-tabs">
        <button
          type="button"
          onClick={() => setTripType('one-way')}
          className={`tab-btn ${tripType === 'one-way' ? 'active' : ''}`}
        >
          One-way Journey
        </button>
        <button
          type="button"
          onClick={() => setTripType('round-trip')}
          className={`tab-btn ${tripType === 'round-trip' ? 'active' : ''}`}
        >
          Round-trip Journey
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-red-light)',
          color: 'var(--danger-red)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSearchSubmit}>
        <div className="search-grid">
          {/* Origin Airport */}
          <div className="form-group">
            <label className="form-label" htmlFor="origin">
              <PlaneTakeoff size={16} color="var(--sky-blue)" />
              From Airport
            </label>
            <select
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="form-control"
              disabled={loadingAirports && airports.length === 0}
              required
            >
              {airports.map((a) => (
                <option key={a.airport_code} value={a.airport_code}>
                  {a.city} ({a.airport_code}) — {a.airport_name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Airport */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="destination">
                <PlaneLanding size={16} color="var(--sky-blue)" />
                To Airport
              </label>
              <button
                type="button"
                onClick={handleSwapAirports}
                style={{ fontSize: '0.75rem', color: 'var(--sky-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}
                title="Swap routes"
              >
                <ArrowRightLeft size={12} /> Swap
              </button>
            </div>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="form-control"
              disabled={loadingAirports && airports.length === 0}
              required
            >
              {airports.map((a) => (
                <option key={a.airport_code} value={a.airport_code}>
                  {a.city} ({a.airport_code}) — {a.airport_name}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <DateSelector
            label="Departure Date"
            value={departureDate}
            onChange={setDepartureDate}
          />

          {/* Return Date (Conditional for round-trip) */}
          <DateSelector
            label="Return Date"
            value={returnDate}
            onChange={setReturnDate}
            minDate={departureDate}
            disabled={tripType !== 'round-trip'}
          />

          {/* Passengers */}
          <PassengerSelector
            adults={passengers.adults}
            childrenCount={passengers.childrenCount}
            onChange={setPassengers}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-accent btn-lg" style={{ minWidth: '220px' }}>
            <Search size={18} />
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
