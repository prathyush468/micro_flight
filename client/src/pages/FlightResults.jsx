import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, AlertCircle, Plane } from 'lucide-react';
import flightService from '../services/flightService';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SearchForm from '../components/SearchForm';

const AIRLINES = ['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'Akasa Air'];

const FlightResults = () => {
  const [searchParams] = useSearchParams();

  // Search Query Params from URL
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);
  const tripType = searchParams.get('tripType') || 'one-way';

  // State
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Filter States
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState('base_fare');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Fetch flights whenever search params or server-side sort changes
  useEffect(() => {
    const fetchFlightData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await flightService.searchFlights({
          origin,
          destination,
          departureDate,
          passengers: passengerCount,
          airline: selectedAirline || undefined,
          maxPrice: maxPrice || undefined,
          sortBy,
          sortOrder
        });
        setFlights(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve flights for the selected route');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [origin, destination, departureDate, passengerCount, selectedAirline, maxPrice, sortBy, sortOrder]);

  const resetFilters = () => {
    setSelectedAirline('');
    setMaxPrice(15000);
    setSortBy('base_fare');
    setSortOrder('ASC');
  };

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      {/* Route & Search Header Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            <span>{origin || 'Any Origin'}</span>
            <Plane size={18} color="var(--sky-blue)" style={{ transform: 'rotate(90deg)' }} />
            <span>{destination || 'Any Destination'}</span>
            <span className="badge badge-sky" style={{ marginLeft: '8px' }}>
              {tripType === 'round-trip' ? 'Round-trip' : 'One-way'}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {departureDate ? new Date(departureDate).toDateString() : 'All Dates'} &bull; {passengerCount} Passenger{passengerCount > 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={() => setShowModifySearch(!showModifySearch)}
          className="btn btn-outline btn-sm"
        >
          <RefreshCw size={14} />
          {showModifySearch ? 'Hide Search' : 'Modify Search'}
        </button>
      </div>

      {/* Collapsible Modify Search Drawer */}
      {showModifySearch && (
        <div style={{ marginBottom: '24px' }}>
          <SearchForm
            initialValues={{
              origin,
              destination,
              departureDate,
              passengers: passengerCount,
              tripType
            }}
          />
        </div>
      )}

      {/* Main Grid: Filters Sidebar + Results List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '24px',
        alignItems: 'flex-start'
      }} className="booking-flow-grid">
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary-navy)' }}>
              <Filter size={18} color="var(--sky-blue)" />
              Filter Results
            </div>
            <button
              onClick={resetFilters}
              style={{ fontSize: '0.75rem', color: 'var(--sky-blue)', fontWeight: 600 }}
            >
              Reset
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="sortBy">
              <ArrowUpDown size={14} color="var(--sky-blue)" />
              Sort Flights By
            </label>
            <select
              id="sortBy"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="form-control"
            >
              <option value="base_fare-ASC">Price: Low to High</option>
              <option value="base_fare-DESC">Price: High to Low</option>
              <option value="departure_time-ASC">Departure: Earliest First</option>
              <option value="departure_time-DESC">Departure: Latest First</option>
              <option value="duration-ASC">Flight Duration: Shortest</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Max Price</label>
              <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>&#8377;{Number(maxPrice).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="15000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sky-blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>&#8377;2,000</span>
              <span>&#8377;15,000</span>
            </div>
          </div>

          {/* Airline Filter */}
          <div className="form-group">
            <label className="form-label">Airlines</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="airline"
                  checked={selectedAirline === ''}
                  onChange={() => setSelectedAirline('')}
                />
                All Airlines
              </label>
              {AIRLINES.map((al) => (
                <label key={al} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="airline"
                    checked={selectedAirline === al}
                    onChange={() => setSelectedAirline(al)}
                  />
                  {al}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Flight Cards Feed */}
        <main>
          {loading ? (
            <LoadingSpinner message="Searching flight schedules in database..." />
          ) : error ? (
            <div style={{
              backgroundColor: 'var(--danger-red-light)',
              color: 'var(--danger-red)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : flights.length === 0 ? (
            <EmptyState
              title="No flights found for this itinerary"
              description="There are currently no flights matching your chosen origin, destination, or price filters. Try adjusting your dates or clearing filters."
              actionText="Reset Search"
              onActionClick={resetFilters}
            />
          ) : (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Showing <strong>{flights.length}</strong> available flight{flights.length > 1 ? 's' : ''}
              </div>

              {flights.map((flight) => (
                <FlightCard
                  key={flight.flight_id}
                  flight={flight}
                  passengerCount={passengerCount}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FlightResults;
