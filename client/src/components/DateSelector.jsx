import React from 'react';
import { Calendar } from 'lucide-react';

const DateSelector = ({
  label = 'Departure Date',
  value,
  onChange,
  minDate,
  disabled = false,
  error = null
}) => {
  // Format today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const effectiveMin = minDate || today;

  return (
    <div className="form-group">
      <label className="form-label">
        <Calendar size={16} color="var(--sky-blue)" />
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={effectiveMin}
        disabled={disabled}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        style={disabled ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default DateSelector;
