import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, User, LogOut, ShieldCheck, Ticket, Search, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar no-print">
      <div className="container navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Plane size={22} />
          </div>
          <div>Sky<span>Book</span></div>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <HomeIcon size={18} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/flights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Search size={18} />
                <span>Search Flights</span>
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Ticket size={18} />
                  <span>My Bookings</span>
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <ShieldCheck size={18} color="#38bdf8" />
                  <span style={{ color: '#38bdf8' }}>Admin Panel</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* User Account Controls */}
        <div className="nav-user-dropdown">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/profile" className="user-badge" title="View Profile">
                <User size={16} />
                <span>{user.fullName?.split(' ')[0] || 'Passenger'}</span>
                {isAdmin && <span className="badge badge-sky" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Admin</span>}
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline btn-sm"
                style={{ padding: '6px 10px', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)' }}
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
