import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Shield, Heart, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer no-print">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="nav-brand" style={{ marginBottom: '14px' }}>
              <div className="nav-brand-icon">
                <Plane size={20} />
              </div>
              <div style={{ color: '#fff' }}>Sky<span style={{ color: '#0284c7' }}>Book</span></div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8' }}>
              Modern Flight Reservation System integrating Software Engineering, User Interface Design Lab, and RDBMS Lab principles.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <span className="badge badge-sky"><Award size={14} /> MCA Semester V</span>
              <span className="badge badge-success"><Shield size={14} /> ACID Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/flights">Search Flights</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/login">Passenger Login</Link></li>
            </ul>
          </div>

          {/* System Roles */}
          <div>
            <h4 className="footer-title">System Roles</h4>
            <ul className="footer-links">
              <li><Link to="/flights">Guest Search</Link></li>
              <li><Link to="/register">Passenger Portal</Link></li>
              <li><Link to="/admin">Administrator Dashboard</Link></li>
              <li><Link to="/profile">Profile Settings</Link></li>
            </ul>
          </div>

          {/* Lab Integration Details */}
          <div>
            <h4 className="footer-title">Academic Integration</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
              <strong>Frontend:</strong> React 18, React Hooks, Responsive CSS<br />
              <strong>Backend:</strong> Node.js, Express.js MVC Architecture<br />
              <strong>Database:</strong> MySQL 8.0, 3NF Normalization, ACID Transactions
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} SkyBook Flight Reservation System. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built for MCA Integrated Semester V with <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
