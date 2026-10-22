import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
  IndianRupee,
  TrendingUp,
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await bookingService.getAdminDashboard();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to compile dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Aggregating MySQL administrative metrics..." />;
  }

  if (error || !stats) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>Dashboard Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>{error}</p>
      </div>
    );
  }

  const { metrics, recentBookings, airlineRevenue, popularRoutes } = stats;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '16px', color: '#ffffff', fontWeight: 800 }}>
          <ShieldCheck size={20} color="#38bdf8" />
          <span>ADMIN PORTAL</span>
        </div>

        <Link to="/admin" className="admin-nav-item active">
          <TrendingUp size={18} /> Dashboard
        </Link>
        <Link to="/admin/flights" className="admin-nav-item">
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

      {/* Main Admin Content */}
      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              System Administration Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time operational KPIs compiled via MySQL Relational Aggregations and ACID Views
            </p>
          </div>
          <Link to="/admin/flights" className="btn btn-primary btn-sm">
            <Plane size={16} /> Schedule Flight
          </Link>
        </div>

        {/* Top 6 KPI Metric Cards */}
        <div className="stats-grid">
          {/* Total Flights */}
          <div className="stat-card">
            <div>
              <div className="stat-val">{metrics.totalFlights}</div>
              <div className="stat-lbl">Scheduled Flights</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--sky-blue-light)', color: 'var(--sky-blue)' }}>
              <Plane size={24} />
            </div>
          </div>

          {/* Total Passengers */}
          <div className="stat-card">
            <div>
              <div className="stat-val">{metrics.totalPassengers}</div>
              <div className="stat-lbl">Registered Passengers</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
              <Users size={24} />
            </div>
          </div>

          {/* Total Bookings */}
          <div className="stat-card">
            <div>
              <div className="stat-val">{metrics.totalBookings}</div>
              <div className="stat-lbl">Total Reservations</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: 'var(--primary-navy)' }}>
              <Ticket size={24} />
            </div>
          </div>

          {/* Confirmed Bookings */}
          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: 'var(--success-green)' }}>{metrics.confirmedBookings}</div>
              <div className="stat-lbl">Confirmed Active</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--success-green-light)', color: 'var(--success-green)' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* Cancelled Bookings */}
          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: 'var(--danger-red)' }}>{metrics.cancelledBookings}</div>
              <div className="stat-lbl">Cancelled Trips</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--danger-red-light)', color: 'var(--danger-red)' }}>
              <XCircle size={24} />
            </div>
          </div>

          {/* Total Gross Revenue */}
          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: 'var(--sky-blue)' }}>
                &#8377;{Number(metrics.totalRevenue).toLocaleString('en-IN')}
              </div>
              <div className="stat-lbl">Confirmed Revenue</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--sky-blue-light)', color: 'var(--sky-blue)' }}>
              <IndianRupee size={24} />
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Recent Bookings & Popular Routes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
          {/* Recent Bookings Table */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Recent Bookings
              </h3>
              <Link to="/admin/bookings" style={{ fontSize: '0.8rem', color: 'var(--sky-blue)', fontWeight: 600 }}>
                View All &rarr;
              </Link>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Customer</th>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td><strong>{b.pnr}</strong></td>
                      <td>{b.customer_name}</td>
                      <td>{b.flight_number}</td>
                      <td>{b.origin} &rarr; {b.destination}</td>
                      <td>&#8377;{Number(b.total_amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${b.booking_status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '16px' }}>
              Top Booked Routes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {popularRoutes.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={16} color="var(--sky-blue)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.route}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.bookings_count} confirmed booking{r.bookings_count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                    &#8377;{Number(r.revenue).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Airline Performance View (vw_revenue_summary) */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '14px' }}>
            Airline Revenue Summary (RDBMS View: vw_revenue_summary)
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Airline Name</th>
                  <th>Total Flights</th>
                  <th>Total Bookings</th>
                  <th>Confirmed Revenue</th>
                  <th>Cancelled Revenue</th>
                </tr>
              </thead>
              <tbody>
                {airlineRevenue.map((a, idx) => (
                  <tr key={idx}>
                    <td><strong>{a.airline_name}</strong></td>
                    <td>{a.total_flights}</td>
                    <td>{a.total_bookings}</td>
                    <td style={{ color: 'var(--success-green)', fontWeight: 700 }}>
                      &#8377;{Number(a.confirmed_revenue).toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: 'var(--danger-red)' }}>
                      &#8377;{Number(a.cancelled_revenue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
