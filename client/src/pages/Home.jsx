import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, Clock, Award, Compass, CreditCard, CheckCircle } from 'lucide-react';
import SearchForm from '../components/SearchForm';

const POPULAR_DESTINATIONS = [
  { city: 'Bengaluru', code: 'BLR', state: 'Karnataka', price: '2,850', bg: 'linear-gradient(135deg, #1e3a8a, #0284c7)' },
  { city: 'Kochi', code: 'COK', state: 'Kerala', price: '2,999', bg: 'linear-gradient(135deg, #065f46, #0d9488)' },
  { city: 'New Delhi', code: 'DEL', state: 'Delhi NCR', price: '5,200', bg: 'linear-gradient(135deg, #7c2d12, #ea580c)' },
  { city: 'Mumbai', code: 'BOM', state: 'Maharashtra', price: '4,500', bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
  { city: 'Goa', code: 'GOI', state: 'Goa', price: '2,750', bg: 'linear-gradient(135deg, #0f766e, #14b8a6)' },
  { city: 'Kolkata', code: 'CCU', state: 'West Bengal', price: '4,900', bg: 'linear-gradient(135deg, #831843, #db2777)' },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Real-Time Seat Availability',
    desc: 'Direct connection to MySQL transactional inventory preventing double bookings.'
  },
  {
    icon: ShieldCheck,
    title: 'ACID Transaction Guarantee',
    desc: 'Concurrent seat locking with atomic COMMIT and automatic ROLLBACK on failure.'
  },
  {
    icon: CreditCard,
    title: 'Simulated Instant Payments',
    desc: 'Test seamless payments with simulated Cards, UPI, and Net Banking.'
  },
  {
    icon: Award,
    title: 'Instant Boarding Pass & PNR',
    desc: 'Unique 6-character PNR generation with print-ready boarding passes.'
  }
];

const STEPS = [
  { step: '01', title: 'Search Flight', desc: 'Select your origin, destination, travel dates, and passenger count.' },
  { step: '02', title: 'Select Itinerary', desc: 'Compare competitive airline fares, flight timings, and seat availability.' },
  { step: '03', title: 'Enter Passenger Info', desc: 'Add passenger traveller details with instant client-side validation.' },
  { step: '04', title: 'Simulated Pay & Fly', desc: 'Confirm simulated payment, receive unique PNR, and print your ticket.' }
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Compass size={16} /> Seamless Flight Booking Experience
            </div>
            <h1 className="hero-title">
              Your Journey Begins Here
            </h1>
            <p className="hero-subtitle">
              Book domestic and international flights at the best fares. Experience fast search, live seat inventory, and instant ticket generation.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Search Card */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <SearchForm />
      </section>

      {/* Popular Destinations */}
      <section className="container" style={{ marginBottom: '70px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-sky" style={{ marginBottom: '8px' }}>Top Routes</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Popular Destinations
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Explore trending routes across India with daily scheduled flights
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.code}
              style={{
                background: dest.bg,
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px',
                transition: 'var(--transition)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {dest.state}
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
                  {dest.city} ({dest.code})
                </h3>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Starting from</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>&#8377;{dest.price}</div>
                </div>
                <Link
                  to={`/flights?destination=${dest.code}`}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#ffffff', color: 'var(--primary-navy)' }}
                >
                  View Flights
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose SkyBook Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '70px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-sky" style={{ marginBottom: '8px' }}>System Architecture</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Why Choose SkyBook?
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Engineered with rigorous academic software principles for resilience, security, and speed.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '28px'
          }}>
            {FEATURES.map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '28px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-page)',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--sky-blue-light)',
                    color: 'var(--sky-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px'
                  }}>
                    <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Steps Section */}
      <section className="container" style={{ padding: '70px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-sky" style={{ marginBottom: '8px' }}>User Flow</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Easy 4-Step Booking Process
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            From search to boarding pass in under two minutes
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="card"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'var(--sky-blue-light)',
                position: 'absolute',
                top: '12px',
                right: '16px',
                lineHeight: 1
              }}>
                {s.step}
              </div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  {s.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
