import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Building,
  Ticket,
  Users,
  TrendingUp,
  ShieldCheck,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import flightService from '../../services/flightService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const ManageFlights = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State for Schedule New Flight
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    flightNumber: '',
    airlineName: 'Air India',
    originAirportId: '',
    destinationAirportId: '',
    departureTime: '',
    arrivalTime: '',
    baseFare: '',
    totalSeats: 180
  });

  // Modal State for Updating Status
  const [statusModalFlight, setStatusModalFlight] = useState(null);
  const [newStatus, setNewStatus] = useState('scheduled');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsData, airportsData] = await Promise.all([
        flightService.searchFlights({}), // pulls all flights
        flightService.getAirports()
      ]);
      setFlights(flightsData);
      setAirports(airportsData);
      if (airportsData.length >= 2 && !addForm.originAirportId) {
        setAddForm((prev) => ({
          ...prev,
          originAirportId: airportsData[0].airport_id,
          destinationAirportId: airportsData[1].airport_id
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load flights and airports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (parseInt(addForm.originAirportId, 10) === parseInt(addForm.destinationAirportId, 10)) {
      alert('Origin and Destination airports cannot be identical');
      return;
    }

    if (new Date(addForm.arrivalTime) <= new Date(addForm.departureTime)) {
      alert('Arrival time must be after departure time');
      return;
    }

    setAddLoading(true);
    try {
      await flightService.createFlight(addForm);
      setSuccessMsg(`Flight ${addForm.flightNumber.toUpperCase()} scheduled successfully!`);
      setShowAddModal(false);
      setAddForm({
        flightNumber: '',
        airlineName: 'Air India',
        originAirportId: airports[0]?.airport_id || '',
        destinationAirportId: airports[1]?.airport_id || '',
        departureTime: '',
        arrivalTime: '',
        baseFare: '',
        totalSeats: 180
      });
      await fetchData();
    } catch (err) {
      alert(`Failed to create flight: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalFlight) return;
    try {
      await flightService.updateFlightStatus(statusModalFlight.flight_id, newStatus);
      setSuccessMsg(`Flight ${statusModalFlight.flight_number} status updated to ${newStatus}`);
      setStatusModalFlight(null);
      await fetchData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '16px', color: '#ffffff', fontWeight: 800 }}>
          <ShieldCheck size={20} color="#38bdf8" />
          <span>ADMIN PORTAL</span>
        </div>

        <Link to="/admin" className="admin-nav-item">
          <TrendingUp size={18} /> Dashboard
        </Link>
        <Link to="/admin/flights" className="admin-nav-item active">
          <Plane size={18} /> Manage Flights
        </Link>
        <Link to="/admin/airports" className="admin-nav-item">
          <Building size={18} /> Manage Airports
        </Link>
        <Link to="/admin/bookings" className="admin-nav-item">
          <Ticket size={18} /> All Bookings
        </Link>
        <Link to="/admin/users" className="admin-nav-item">
          <Users size={18} /> Registered Users
        </Link>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Manage Flight Itineraries
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create, update flight schedules, manage seat inventory, and update operational statuses.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Schedule New Flight
          </button>
        </div>

        {successMsg && (
          <div style={{
            backgroundColor: 'var(--success-green-light)',
            color: 'var(--success-green)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Retrieving scheduled flights from MySQL..." />
        ) : (
          <div className="card" style={{ padding: '20px' }}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Flight No</th>
                    <th>Airline</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Fare</th>
                    <th>Seats Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((f) => (
                    <tr key={f.flight_id}>
                      <td><strong>{f.flight_number}</strong></td>
                      <td>{f.airline_name}</td>
                      <td>
                        <strong>{f.origin_code}</strong> ({f.origin_city}) &rarr; <strong>{f.destination_code}</strong> ({f.destination_city})
                      </td>
                      <td>
                        {formatDate(f.departure_time)}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(f.departure_time)}</div>
                      </td>
                      <td>
                        {formatDate(f.arrival_time)}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(f.arrival_time)}</div>
                      </td>
                      <td><strong>&#8377;{Number(f.base_fare).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{f.available_seats}</span> / {f.total_seats}
                      </td>
                      <td>
                        <span className={`badge ${
                          f.status === 'scheduled' ? 'badge-success' :
                          f.status === 'delayed' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setStatusModalFlight(f);
                            setNewStatus(f.status);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Edit size={12} /> Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Schedule New Flight */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '16px' }}>
                Schedule New Flight
              </h3>

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormInput
                    label="Flight Number"
                    name="flightNumber"
                    value={addForm.flightNumber}
                    onChange={(e) => setAddForm({ ...addForm, flightNumber: e.target.value })}
                    placeholder="e.g., AI-771, 6E-205"
                    required
                  />

                  <div className="form-group">
                    <label className="form-label">Airline Carrier</label>
                    <select
                      value={addForm.airlineName}
                      onChange={(e) => setAddForm({ ...addForm, airlineName: e.target.value })}
                      className="form-control"
                    >
                      <option value="Air India">Air India</option>
                      <option value="IndiGo">IndiGo</option>
                      <option value="Vistara">Vistara</option>
                      <option value="SpiceJet">SpiceJet</option>
                      <option value="Akasa Air">Akasa Air</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Origin Airport</label>
                    <select
                      value={addForm.originAirportId}
                      onChange={(e) => setAddForm({ ...addForm, originAirportId: e.target.value })}
                      className="form-control"
                      required
                    >
                      {airports.map((a) => (
                        <option key={a.airport_id} value={a.airport_id}>
                          {a.city} ({a.airport_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Airport</label>
                    <select
                      value={addForm.destinationAirportId}
                      onChange={(e) => setAddForm({ ...addForm, destinationAirportId: e.target.value })}
                      className="form-control"
                      required
                    >
                      {airports.map((a) => (
                        <option key={a.airport_id} value={a.airport_id}>
                          {a.city} ({a.airport_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Departure Timestamp</label>
                    <input
                      type="datetime-local"
                      value={addForm.departureTime}
                      onChange={(e) => setAddForm({ ...addForm, departureTime: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Arrival Timestamp</label>
                    <input
                      type="datetime-local"
                      value={addForm.arrivalTime}
                      onChange={(e) => setAddForm({ ...addForm, arrivalTime: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FormInput
                    label="Base Fare (₹)"
                    name="baseFare"
                    type="number"
                    min="1000"
                    step="50"
                    value={addForm.baseFare}
                    onChange={(e) => setAddForm({ ...addForm, baseFare: e.target.value })}
                    placeholder="e.g., 3450"
                    required
                  />

                  <FormInput
                    label="Seat Capacity"
                    name="totalSeats"
                    type="number"
                    min="20"
                    max="400"
                    value={addForm.totalSeats}
                    onChange={(e) => setAddForm({ ...addForm, totalSeats: e.target.value })}
                    placeholder="180"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {addLoading ? 'Inserting into MySQL...' : 'Schedule Flight'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Update Status */}
        {statusModalFlight && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '14px' }}>
                Update Flight Status — {statusModalFlight.flight_number}
              </h3>
              <form onSubmit={handleUpdateStatusSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Operational Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="scheduled">Scheduled (Normal)</option>
                    <option value="delayed">Delayed</option>
                    <option value="departed">Departed</option>
                    <option value="arrived">Arrived</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="inactive">Inactive (Hide from Search)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStatusModalFlight(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageFlights;
