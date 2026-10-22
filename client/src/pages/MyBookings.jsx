import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Clock, Ticket, AlertCircle, XCircle, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'cancelled'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change in travel plan');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelReason('Change in personal schedule');
    setSuccessMsg('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const res = await bookingService.cancelBooking(cancellingBooking.booking_id, cancelReason);
      setSuccessMsg(`Booking ${cancellingBooking.pnr} cancelled. Refund of ₹${res.refundAmount.toLocaleString()} has been processed.`);
      setCancellingBooking(null);
      await fetchBookings();
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const isFuture = new Date(b.departure_time) > new Date();
    if (activeTab === 'upcoming') {
      return b.booking_status === 'confirmed' && isFuture;
    }
    if (activeTab === 'cancelled') {
      return b.booking_status === 'cancelled';
    }
    if (activeTab === 'completed') {
      return b.booking_status === 'confirmed' && !isFuture;
    }
    return true; // 'all'
  });

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            My Bookings & Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome back, <strong>{user?.fullName}</strong>. Manage your scheduled flights and view boarding passes.
          </p>
        </div>

        <Link to="/flights" className="btn btn-primary">
          <Search size={16} /> Book New Flight
        </Link>
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

      {/* Tabs */}
      <div className="trip-type-tabs" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          Upcoming Trips
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
        >
          Cancelled ({bookings.filter(b => b.booking_status === 'cancelled').length})
        </button>
      </div>

      {/* Bookings Feed */}
      {loading ? (
        <LoadingSpinner message="Fetching your reservations from MySQL..." />
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
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
          description="You don't have any flight reservations in this category yet."
          actionText="Search Available Flights"
          actionLink="/flights"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => {
            const isCancelled = b.booking_status === 'cancelled';
            const isFuture = new Date(b.departure_time) > new Date();

            return (
              <div key={b.booking_id} className="card" style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge badge-sky" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                      PNR: {b.pnr}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Booked on {formatDate(b.booking_date)}
                    </span>
                  </div>

                  <div>
                    {isCancelled ? (
                      <span className="badge badge-danger">Cancelled</span>
                    ) : (
                      <span className="badge badge-success">Confirmed</span>
                    )}
                  </div>
                </div>

                {/* Itinerary Summary Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Flight</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                      {b.airline_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {b.flight_number}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Route & Timings</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                      {b.origin_code} ({b.origin_city}) &rarr; {b.destination_code} ({b.destination_city})
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(b.departure_time)} at {formatTime(b.departure_time)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passengers & Amount</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                      &#8377;{Number(b.total_amount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {b.passenger_count} Traveller{b.passenger_count > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Link to={`/booking/confirmation/${b.pnr}`} className="btn btn-outline btn-sm">
                      <Ticket size={14} /> View Ticket
                    </Link>

                    {!isCancelled && isFuture && (
                      <button
                        onClick={() => handleOpenCancelModal(b)}
                        className="btn btn-sm"
                        style={{ color: 'var(--danger-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {isCancelled && b.refund_amount > 0 && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--danger-red)'
                  }}>
                    Refund Processed: <strong>&#8377;{Number(b.refund_amount).toLocaleString('en-IN')}</strong> (85% refund policy)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '12px' }}>
              Cancel Flight Reservation
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Are you sure you want to cancel booking <strong>{cancellingBooking.pnr}</strong> ({cancellingBooking.flight_number})?
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Amount Paid:</span>
                <strong>&#8377;{Number(cancellingBooking.total_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <span>Cancellation Fee (15%):</span>
                <span>&#8377;{(Number(cancellingBooking.total_amount) * 0.15).toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px dashed var(--border-medium)',
                paddingTop: '8px',
                fontWeight: 700,
                color: 'var(--success-green)'
              }}>
                <span>Estimated Refund (85%):</span>
                <span>&#8377;{(Number(cancellingBooking.total_amount) * 0.85).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-control"
              >
                <option value="Change in personal schedule">Change in personal schedule</option>
                <option value="Found alternative transport">Found alternative transport</option>
                <option value="Medical or health reason">Medical or health reason</option>
                <option value="Weather or operational changes">Weather or operational changes</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="btn btn-outline btn-sm"
                disabled={cancelLoading}
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="btn btn-danger btn-sm"
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
