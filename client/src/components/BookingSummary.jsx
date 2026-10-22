import React from 'react';
import { Plane, ShieldCheck, Info } from 'lucide-react';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
};

const BookingSummary = ({ flight, passengerCount = 1 }) => {
  if (!flight) return null;

  const baseSubtotal = Number(flight.base_fare) * passengerCount;
  const gst = Math.round(baseSubtotal * 0.05 * 100) / 100;
  const airportFee = Math.round(baseSubtotal * 0.07 * 100) / 100;
  const totalAmount = baseSubtotal + gst + airportFee;

  return (
    <div className="booking-summary-box">
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '16px' }}>
        Fare & Journey Summary
      </h3>

      {/* Flight snapshot */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{flight.airline_name}</span>
          <span className="badge badge-sky">{flight.flight_number}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <div>
            <strong>{flight.origin_code}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(flight.departure_time)}</div>
          </div>
          <Plane size={14} color="var(--sky-blue)" />
          <div style={{ textAlign: 'right' }}>
            <strong>{flight.destination_code}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(flight.arrival_time)}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Travel Date: {formatDate(flight.departure_time)}
        </div>
      </div>

      {/* Itemized Fare Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Base Fare ({passengerCount} Traveller{passengerCount > 1 ? 's' : ''})</span>
          <span style={{ fontWeight: 600 }}>&#8377;{baseSubtotal.toLocaleString('en-IN')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Aviation GST (5%)</span>
          <span style={{ fontWeight: 600 }}>&#8377;{gst.toLocaleString('en-IN')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Airport & Fuel Surcharges (7%)</span>
          <span style={{ fontWeight: 600 }}>&#8377;{airportFee.toLocaleString('en-IN')}</span>
        </div>

        <div style={{
          borderTop: '2px dashed var(--border-medium)',
          paddingTop: '10px',
          marginTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>Total Payable</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-orange)' }}>
            &#8377;{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Trust & Policy Note */}
      <div style={{
        backgroundColor: 'var(--sky-blue-subtle)',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '10px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start'
      }}>
        <ShieldCheck size={16} color="var(--sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>Simulated payment test environment. No real banking details or charges required.</span>
      </div>
    </div>
  );
};

export default BookingSummary;
