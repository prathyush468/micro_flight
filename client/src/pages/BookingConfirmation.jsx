import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Printer, Plane, Calendar, Clock, Download, ArrowRight, User, AlertCircle } from 'lucide-react';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const BookingConfirmation = () => {
  const { pnr } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingTicket = async () => {
      try {
        const data = await bookingService.getBookingDetails(pnr);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve ticket reservation details');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingTicket();
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Retrieving your confirmed e-Ticket..." />;
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>Ticket Retrieval Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>{error}</p>
        <Link to="/my-bookings" className="btn btn-primary">
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 16px 60px' }}>
      {/* Top Banner (hidden on print) */}
      <div className="no-print" style={{
        backgroundColor: 'var(--success-green-light)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-green)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your electronic ticket has been generated. Confirmation sent to <strong>{booking.customer_email}</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} /> Print e-Ticket
          </button>
          <Link to="/my-bookings" className="btn btn-outline btn-sm">
            My Bookings
          </Link>
        </div>
      </div>

      {/* Official Boarding Pass Ticket Layout (Print-ready) */}
      <div className="ticket-container ticket-print-wrapper" style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Ticket Header */}
        <div className="ticket-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: 'var(--sky-blue)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: 'var(--radius-md)'
            }}>
              <Plane size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                SkyBook e-Ticket Receipt
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Official Flight Reservation System &bull; Electronic Passenger Ticket
              </div>
            </div>
          </div>

          <div className="pnr-box">
            <div className="pnr-label">Booking Reference (PNR)</div>
            <div className="pnr-value">{booking.pnr}</div>
          </div>
        </div>

        {/* Flight & Travel Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-light)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Airline & Flight</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {booking.airline_name} ({booking.flight_number})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking ID / Date</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              #{booking.booking_id} &bull; {formatDate(booking.booking_date)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin Airport</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {booking.origin_city} ({booking.origin_code})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Departure: {formatTime(booking.departure_time)} ({formatDate(booking.departure_time)})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Airport</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {booking.destination_city} ({booking.destination_code})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Arrival: {formatTime(booking.arrival_time)} ({formatDate(booking.arrival_time)})
            </div>
          </div>
        </div>

        {/* Passenger Table */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px' }}>
            Passenger & Seat Allocation
          </h4>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Passenger Name</th>
                  <th>Type</th>
                  <th>Gender</th>
                  <th>Assigned Seat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers?.map((p, idx) => (
                  <tr key={p.passenger_id || idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{p.full_name}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.passenger_type}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.gender || 'N/A'}</td>
                    <td>
                      <span className="badge badge-sky" style={{ fontSize: '0.85rem' }}>
                        {p.seat_number || `12${String.fromCharCode(65 + idx)}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Confirmed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment & Audit Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          borderTop: '2px solid var(--border-light)',
          paddingTop: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Method</div>
            <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{booking.payment_method || 'CARD'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transaction Reference</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{booking.transaction_reference || 'TXN-SKY-DEMO'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Status</div>
            <div>
              <span className={`badge ${booking.payment_status === 'refunded' ? 'badge-danger' : 'badge-success'}`}>
                {booking.payment_status || 'SUCCESS'}
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount Paid</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              &#8377;{Number(booking.total_amount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          borderTop: '1px dashed var(--border-medium)',
          paddingTop: '14px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: '1.5'
        }}>
          <strong>Important Travel Notice:</strong> Please arrive at the airport at least 2 hours before scheduled departure. A valid government photo ID along with this e-Ticket is required for airport check-in and boarding gate security.
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
