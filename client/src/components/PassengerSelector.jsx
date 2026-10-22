import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus, ChevronDown } from 'lucide-react';

const PassengerSelector = ({ adults, childrenCount, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalPassengers = adults + childrenCount;

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateAdults = (delta) => {
    const nextVal = adults + delta;
    if (nextVal >= 1 && nextVal + childrenCount <= 9) {
      onChange({ adults: nextVal, childrenCount });
    }
  };

  const updateChildren = (delta) => {
    const nextVal = childrenCount + delta;
    if (nextVal >= 0 && adults + nextVal <= 9) {
      onChange({ adults, childrenCount: nextVal });
    }
  };

  return (
    <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
      <label className="form-label">
        <Users size={16} color="var(--sky-blue)" />
        Travellers
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-control"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          cursor: 'pointer',
          backgroundColor: '#ffffff'
        }}
      >
        <span>
          {totalPassengers} Traveller{totalPassengers > 1 ? 's' : ''}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
            ({adults}A{childrenCount > 0 ? `, ${childrenCount}C` : ''})
          </span>
        </span>
        <ChevronDown size={16} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          padding: '16px',
          zIndex: 50
        }}>
          {/* Adults row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Adults</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age 12+ yrs</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => updateAdults(-1)}
                disabled={adults <= 1}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderRadius: '50%', width: '28px', height: '28px' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 700, width: '16px', textAlign: 'center' }}>{adults}</span>
              <button
                type="button"
                onClick={() => updateAdults(1)}
                disabled={adults + childrenCount >= 9}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderRadius: '50%', width: '28px', height: '28px' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Children row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Children</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age 2 - 11 yrs</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => updateChildren(-1)}
                disabled={childrenCount <= 0}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderRadius: '50%', width: '28px', height: '28px' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 700, width: '16px', textAlign: 'center' }}>{childrenCount}</span>
              <button
                type="button"
                onClick={() => updateChildren(1)}
                disabled={adults + childrenCount >= 9}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderRadius: '50%', width: '28px', height: '28px' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn btn-primary btn-sm btn-full"
          >
            Apply ({totalPassengers} Travellers)
          </button>
        </div>
      )}
    </div>
  );
};

export default PassengerSelector;
