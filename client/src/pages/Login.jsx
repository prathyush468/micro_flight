import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluation & viva
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container" style={{ maxWidth: '460px', padding: '60px 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--sky-blue-light)',
            color: 'var(--sky-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Welcome to SkyBook
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your flight bookings and profile
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-red-light)',
            color: 'var(--danger-red)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., john.doe@example.com"
            icon={Mail}
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={Lock}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Fill Pills for Academic Viva */}
        <div style={{
          marginTop: '24px',
          padding: '14px',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-medium)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Sparkles size={14} color="var(--sky-blue)" /> Demo Credentials for Viva:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemo('john.doe@example.com', 'User@123')}
              className="badge badge-sky"
              style={{ cursor: 'pointer', padding: '6px 10px', textTransform: 'none' }}
            >
              Passenger: john.doe@example.com
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@skybook.com', 'Admin@123')}
              className="badge badge-warning"
              style={{ cursor: 'pointer', padding: '6px 10px', textTransform: 'none' }}
            >
              Admin: admin@skybook.com
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--sky-blue)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
