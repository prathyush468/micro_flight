import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plane,
  Building,
  Ticket,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await bookingService.getAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
        <Link to="/admin/bookings" className="admin-nav-item">
          <Ticket size={18} /> All Bookings
        </Link>
        <Link to="/admin/users" className="admin-nav-item active">
          <Users size={18} /> Registered Users
        </Link>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Registered Users Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Browse registered passengers, administrative personnel, contact information, and total reservations.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving user directory..." />
        ) : (
          <div className="card" style={{ padding: '20px' }}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Total Bookings</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>#{u.user_id}</td>
                      <td><strong>{u.full_name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-sky' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                          {u.total_bookings}
                        </span>
                      </td>
                      <td>{formatDate(u.created_at)}</td>
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

export default ManageUsers;
