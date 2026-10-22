import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Plane,
  Building,
  Users,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAdminBookings({
        search: search || undefined,
        status: statusFilter || undefined
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
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
        <Link to="/admin/airports" className="admin-nav-item">
          <Building size={18} /> Manage Airports
        </Link>
        <Link to="/admin/bookings" className="admin-nav-item active">
          <Ticket size={18} /> All Bookings
        </Link>
        <Link to="/admin/users" className="admin-nav-item">
          <Users size={18} /> Registered Users
        </Link>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            All Customer Bookings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Search reservations by PNR, customer name, flight number, or filter by booking status.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="card" style={{ padding: '18px', marginBottom: '24px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by PNR, passenger name, email, or flight number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
              />
            </div>

            <div style={{ width: '180px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={16} /> Search Bookings
            </button>
          </form>
        </div>

        {loading ? (
          <LoadingSpinner message="Searching customer bookings..." />
        ) : (
          <div className="card" style={{ padding: '20px' }}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Booking Date</th>
                    <th>Pax</th>
                    <th>Total Fare</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td><span className="badge badge-sky">{b.pnr}</span></td>
                      <td><strong>{b.customer_name}</strong></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customer_email}</td>
                      <td>{b.flight_number}</td>
                      <td>{b.origin_code} &rarr; {b.destination_code}</td>
                      <td>{formatDate(b.booking_date)}</td>
                      <td>{b.passenger_count}</td>
                      <td><strong>&#8377;{Number(b.total_amount).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                          {b.payment_method || 'CARD'} ({b.payment_status})
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                          {b.booking_status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/booking/confirmation/${b.pnr}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                          <Eye size={12} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageBookings;
