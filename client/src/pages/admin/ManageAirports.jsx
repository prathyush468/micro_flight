import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Plane,
  Ticket,
  Users,
  TrendingUp,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import flightService from '../../services/flightService';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/FormInput';

const ManageAirports = () => {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    airportCode: '',
    airportName: '',
    city: '',
    country: 'India'
  });

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const data = await flightService.getAirports();
      setAirports(data);
    } catch (err) {
      setError('Failed to load airports directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    try {
      await bookingService.createAirport(form);
      setSuccessMsg(`Airport ${form.airportCode.toUpperCase()} added successfully!`);
      setShowAddModal(false);
      setForm({ airportCode: '', airportName: '', city: '', country: 'India' });
      await fetchAirports();
    } catch (err) {
      alert(`Airport creation failed: ${err.message}`);
    } finally {
      setAddLoading(false);
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
        <Link to="/admin/flights" className="admin-nav-item">
          <Plane size={18} /> Manage Flights
        </Link>
        <Link to="/admin/airports" className="admin-nav-item active">
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
              Manage Airports Directory
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Maintain IATA 3-letter station codes, international airports, and destinations.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add New Airport
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
          <LoadingSpinner message="Fetching airports from database..." />
        ) : (
          <div className="card" style={{ padding: '20px' }}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Airport Code (IATA)</th>
                    <th>Airport Name</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Operational Status</th>
                  </tr>
                </thead>
                <tbody>
                  {airports.map((a) => (
                    <tr key={a.airport_id}>
                      <td>
                        <span className="badge badge-sky" style={{ fontSize: '0.85rem' }}>
                          {a.airport_code}
                        </span>
                      </td>
                      <td><strong>{a.airport_name}</strong></td>
                      <td>{a.city}</td>
                      <td>{a.country}</td>
                      <td>
                        <span className="badge badge-success">Active Station</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Airport */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '16px' }}>
                Add New Airport Station
              </h3>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <FormInput
                  label="IATA Airport Code"
                  name="airportCode"
                  value={form.airportCode}
                  onChange={(e) => setForm({ ...form, airportCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., IXC, TRV, PNQ"
                  required
                />

                <FormInput
                  label="Airport Full Name"
                  name="airportName"
                  value={form.airportName}
                  onChange={(e) => setForm({ ...form, airportName: e.target.value })}
                  placeholder="e.g., Pune International Airport"
                  required
                />

                <FormInput
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g., Pune"
                  required
                />

                <FormInput
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="India"
                  required
                />

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
                    {addLoading ? 'Inserting...' : 'Save Airport'}
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

export default ManageAirports;
