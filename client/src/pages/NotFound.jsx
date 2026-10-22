import React from 'react';
import { Link } from 'react-router-dom';
import { PlaneTakeoff, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '90px 16px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--sky-blue-light)',
        color: 'var(--sky-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        <PlaneTakeoff size={40} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-navy)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
        Flight Route Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 28px' }}>
        The destination or URL you are navigating to does not exist or has been relocated in the SkyBook system.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} /> Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
