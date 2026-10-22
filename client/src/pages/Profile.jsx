import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, Calendar, Ticket, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const bookings = await bookingService.getMyBookings();
        setBookingCount(bookings.length);
      } catch (e) {
        // ignore
      }
    };
    fetchCount();
  }, []);

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '640px', padding: '48px 16px 60px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--sky-blue-light)',
            color: 'var(--sky-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              {user.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className={`badge ${isAdmin ? 'badge-sky' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                <Shield size={12} /> {user.role}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Registered Passenger
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Mail size={18} color="var(--sky-blue)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Phone size={18} color="var(--sky-blue)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</div>
              <div style={{ fontWeight: 600 }}>{user.phone || '+91 Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Ticket size={18} color="var(--sky-blue)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Reservations Made</div>
              <div style={{ fontWeight: 600 }}>{bookingCount} flight booking(s)</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
          <Link to="/my-bookings" className="btn btn-primary" style={{ flex: 1 }}>
            <Ticket size={16} /> View Bookings
          </Link>
          <Link to="/flights" className="btn btn-outline" style={{ flex: 1 }}>
            <Compass size={16} /> Search Flights
          </Link>
          {isAdmin && (
            <Link to="/admin" className="btn btn-secondary btn-full" style={{ marginTop: '8px' }}>
              <Shield size={16} /> Go to Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
