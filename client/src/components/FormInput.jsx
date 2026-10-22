import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  min,
  max,
  icon: Icon
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {Icon && <Icon size={16} color="var(--sky-blue)" />}
          {label} {required && <span style={{ color: 'var(--danger-red)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          style={isPassword ? { paddingRight: '40px' } : {}}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormInput;
