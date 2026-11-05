import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, ShieldCheck, Clock, Award, Compass, CreditCard, CheckCircle, MapPin, ArrowRight, RotateCw, LayoutGrid } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import flightService from '../services/flightService';
import heroAirplaneImg from '../assets/hero-airplane.jpg';
import flightSkyContrailsImg from '../assets/flight-sky-contrails.jpg';
import flightRoutesMapImg from '../assets/flight-routes-map.jpg';
import { BlurText, ShinyText, CountUp, SpotlightCard, Particles, StarBorder, CircularCarousel, DotGrid, GridDistortion, Hyperspeed, FallingText, ParticleText, CircularGallery, SplitFlapText, LetterGlitch } from '../components/reactbits';

// High Quality Airline Cards with Official Company Logos & Fleet Imagery
import cardAirIndia from '../assets/airlines/card-airindia.jpg';
import cardIndiGo from '../assets/airlines/card-indigo.jpg';
import cardSpiceJet from '../assets/airlines/card-spicejet.jpg';
import cardVistara from '../assets/airlines/card-vistara.jpg';
import cardAkasa from '../assets/airlines/card-akasa.jpg';

// Official Airline Logos for Badges
import logoAirIndia from '../assets/airlines/airindia-logo.png';
import logoIndiGo from '../assets/airlines/indigo-logo.png';
import logoSpiceJet from '../assets/airlines/spicejet-logo.png';
import logoVistara from '../assets/airlines/vistara-logo.png';
import logoAkasa from '../assets/airlines/akasa-logo.png';

// Authentic Landmark Imagery for Top Destinations
import bengaluruImg from '../assets/destinations/bengaluru.jpg';
import kochiImg from '../assets/destinations/kochi.jpg';
import delhiImg from '../assets/destinations/delhi.jpg';
import mumbaiImg from '../assets/destinations/mumbai.jpg';
import goaImg from '../assets/destinations/goa.jpg';
import kolkataImg from '../assets/destinations/kolkata.jpg';

const POPULAR_DESTINATIONS = [
  {
    city: 'Bengaluru',
    code: 'BLR',
    state: 'Karnataka',
    landmark: 'Vidhana Soudha & Garden City',
    price: 2850,
    image: bengaluruImg
  },
  {
    city: 'Kochi',
    code: 'COK',
    state: 'Kerala',
    landmark: 'Backwaters & Queen of Arabian Sea',
    price: 2999,
    image: kochiImg
  },
  {
    city: 'New Delhi',
    code: 'DEL',
    state: 'Delhi NCR',
    landmark: 'India Gate & Historical Heritage',
    price: 5200,
    image: delhiImg
  },
  {
    city: 'Mumbai',
    code: 'BOM',
    state: 'Maharashtra',
    landmark: 'Gateway of India & Marine Drive',
    price: 4500,
    image: mumbaiImg
  },
  {
    city: 'Goa',
    code: 'GOI',
    state: 'Goa',
    landmark: 'Pristine Beaches & Coastal Sunset',
    price: 2750,
    image: goaImg
  },
  {
    city: 'Kolkata',
    code: 'CCU',
    state: 'West Bengal',
    landmark: 'Victoria Memorial & Cultural Capital',
    price: 4900,
    image: kolkataImg
  }
];

const BASE_AIRLINES = [
  {
    name: 'Air India',
    code: 'AI',
    primaryColor: '#c8102e',
    logo: logoAirIndia,
    cardImage: cardAirIndia,
    aircraftModel: 'Boeing 787-8 Dreamliner',
    startingFare: 3450,
    rating: 4.8,
    tagline: 'Maharaja Hospitality & Global Reach',
    perks: ['Complimentary Hot Meals', 'Free 15kg Check-in', 'Dreamliner Widebody Comfort'],
    description: 'India’s premier flag carrier offering full-service domestic & international journeys with world-class hospitality.'
  },
  {
    name: 'Akasa Air',
    code: 'QP',
    primaryColor: '#f35a24',
    logo: logoAkasa,
    cardImage: cardAkasa,
    aircraftModel: 'Boeing 737 MAX 8',
    startingFare: 2750,
    rating: 4.7,
    tagline: 'Fresh, Dependable & Eco-Friendly',
    perks: ['Ultra-Quiet Modern Cabin', 'USB Fast Charging Ports', 'Cafe Akasa Delicacies'],
    description: 'India’s fastest-growing airline offering warm, dependable, affordable, and eco-friendly air travel.'
  },
  {
    name: 'Vistara',
    code: 'UK',
    primaryColor: '#531b4d',
    logo: logoVistara,
    cardImage: cardVistara,
    aircraftModel: 'Airbus A321neo Long Range',
    startingFare: 5200,
    rating: 4.9,
    tagline: 'Fly the New Feeling of Luxury',
    perks: ['Gourmet Dining', 'Italian Leather Seats', 'Wireless In-flight Media'],
    description: 'Luxury full-service airline providing gourmet culinary selections, premium seating, and bespoke cabin service.'
  },
  {
    name: 'SpiceJet',
    code: 'SG',
    primaryColor: '#d8232a',
    logo: logoSpiceJet,
    cardImage: cardSpiceJet,
    aircraftModel: 'Boeing 737-800 Next-Gen',
    startingFare: 3999,
    rating: 4.6,
    tagline: 'Red. Hot. Spicy. Direct Routes',
    perks: ['SpiceMax Extra Legroom', 'Hot Meals On Demand', 'Direct Regional Connectivity'],
    description: 'Popular budget carrier providing affordable connectivity to non-metro tourist hubs and holiday getaways.'
  },
  {
    name: 'IndiGo',
    code: '6E',
    primaryColor: '#001b94',
    logo: logoIndiGo,
    cardImage: cardIndiGo,
    aircraftModel: 'Airbus A320neo',
    startingFare: 2999,
    rating: 4.9,
    tagline: 'India’s #1 On-Time Airline',
    perks: ['#1 On-Time Reliability', '1,900+ Daily Flights', '7kg Cabin Baggage'],
    description: 'India’s largest passenger airline with punctual service, unmatched nationwide frequency, and fuel-efficient fleet.'
  }
];

const GALLERY_ITEMS = BASE_AIRLINES.map((a) => ({
  image: a.cardImage,
  text: a.name,
  caption: `${a.tagline} • ${a.aircraftModel} • Fares from ₹${a.startingFare.toLocaleString('en-IN')}`,
  airline: a
}));

const Home = () => {
  const navigate = useNavigate();
  const [activeDestIndex, setActiveDestIndex] = useState(0);
  const [destViewMode, setDestViewMode] = useState('carousel');
  const [glitchClickEffect, setGlitchClickEffect] = useState('tear');
  const [activeAirlineIndex, setActiveAirlineIndex] = useState(0);

  const activeAirline = BASE_AIRLINES[activeAirlineIndex] || BASE_AIRLINES[0];
  const [distortionMode, setDistortionMode] = useState('drag');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = windowWidth > 1200 ? 420 : windowWidth > 768 ? 350 : 280;
  const stageHeight = windowWidth > 1200 ? '580px' : windowWidth > 768 ? '510px' : '440px';
  const heroFontSize = windowWidth > 1200 ? '3rem' : windowWidth > 768 ? '2.4rem' : '1.85rem';
  const heroStageHeight = windowWidth > 768 ? '140px' : '110px';

  const carouselItems = useMemo(() => {
    return POPULAR_DESTINATIONS.map((dest) => ({
      src: dest.image,
      alt: dest.city,
      title: dest.city,
      subtitle: `${dest.landmark} • Starting ₹${dest.price.toLocaleString('en-IN')}`,
      city: dest.city,
      code: dest.code,
      state: dest.state,
      landmark: dest.landmark,
      price: dest.price
    }));
  }, []);

  const activeDest = POPULAR_DESTINATIONS[activeDestIndex] || POPULAR_DESTINATIONS[0];

  return (
    <div>
      {/* Hero Section with React Bits Particles */}
      <section
        className="hero-section"
        style={{
          position: 'relative',
          backgroundImage: `url(${heroAirplaneImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0e1f3d',
          overflow: 'hidden'
        }}
      >
        <Particles
          particleCount={55}
          speed={0.4}
          particleColors={['#ffffff', '#38bdf8', '#7dd3fc', '#bae6fd']}
          moveParticlesOnHover={true}
          particleHoverFactor={1.4}
        />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content">
            <div className="hero-badge">
              <Compass size={16} />
              <ShinyText
                text="Seamless Flight Booking Experience"
                speed={3.5}
                color="#cbd5e1"
                shineColor="#ffffff"
              />
            </div>
            {/* Screen-reader Accessible H1 */}
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
              Your Journey Begins Here
            </h1>

            {/* React Bits FallingText Physics Title */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '820px', margin: '4px auto 12px', height: heroStageHeight }}>
              <FallingText
                text="Your Journey Begins Here"
                highlightWords={["Journey", "Here"]}
                highlightClass="highlighted"
                trigger="hover"
                variant="text"
                split="words"
                gravity={0.9}
                bounciness={0.32}
                scatter={0.25}
                stagger={0.035}
                order="random"
                draggable={true}
                cursorPush={0.4}
                restoreDelay={3.5}
                fontSize={heroFontSize}
                accentColor="#38bdf8"
                theme="dark"
                backgroundColor="transparent"
                style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.8), 0 4px 25px rgba(0, 0, 0, 0.9)'
                }}
              />
            </div>
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

      {/* Popular Destinations with React Bits WebGL Particles Background & 3D Carousel */}
      <section
        style={{
          position: 'relative',
          padding: '70px 0 90px',
          marginBottom: '20px',
          overflow: 'hidden',
          backgroundColor: '#050d1a'
        }}
      >
        {/* React Bits LetterGlitch Background Canvas */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}
        >
          <LetterGlitch
            speed={0.8}
            glitchColors={['#38bdf8', '#00e5ff', '#818cf8', '#ffffff']}
            baseColor="#1e293b"
            baseOpacity={0.25}
            fontSize={14}
            density={0.92}
            interactive={true}
            cursorRadius={180}
            clickEffect={glitchClickEffect}
            flow={0.55}
            edgeFade={0.2}
            centerFade={0.25}
            backgroundColor="#050d1a"
          />
        </div>

        {/* Deep Cosmic Radial Vignette Overlay for maximum contrast & readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(5, 13, 26, 0.35) 0%, rgba(5, 13, 26, 0.88) 100%)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              className="badge"
              style={{
                marginBottom: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 12px',
                fontWeight: 600
              }}
            >
              <ShinyText text="Top Routes" speed={3} color="#38bdf8" shineColor="#ffffff" />
            </span>
            <div style={{ width: '100%', height: '110px', position: 'relative', margin: '4px 0 6px' }}>
              <ParticleText
                text="Popular Destinations"
                particleSize={2.2}
                density={4}
                color="#ffffff"
                highlightColor="#38bdf8"
                highlightMode="motion"
                shape="circle"
                intro="gather"
                scatter={160}
                gatherDuration={1500}
                stagger={380}
                clickBurst={true}
                burstStrength={1.2}
                pointerRepel={40}
                repelRadius={120}
                idleDrift={0.6}
                trigger="hover"
                fontSize="clamp(2rem, 5vw, 3.2rem)"
                fontWeight={800}
                fontFamily="inherit"
                glow={true}
                style={{ width: '100%', height: '100%', minHeight: '100px' }}
              />
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', textShadow: '0 1px 6px rgba(0, 0, 0, 0.7)' }}>
              Explore trending routes across India with daily scheduled flights
            </p>

            {/* View Mode & Hyperspeed Curve Selector with Glassmorphism */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '16px'
            }}>
              {/* Carousel / Grid Toggle */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: 'var(--radius-full)',
                padding: '3px'
              }}>
                <button
                  type="button"
                  onClick={() => setDestViewMode('carousel')}
                  className={`btn btn-sm ${destViewMode === 'carousel' ? 'btn-primary' : ''}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    border: 'none',
                    background: destViewMode === 'carousel' ? 'var(--sky-blue)' : 'transparent',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCw size={13} />
                  <span>3D Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDestViewMode('grid')}
                  className={`btn btn-sm ${destViewMode === 'grid' ? 'btn-primary' : ''}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    border: 'none',
                    background: destViewMode === 'grid' ? 'var(--sky-blue)' : 'transparent',
                    color: destViewMode === 'grid' ? '#ffffff' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <LayoutGrid size={13} />
                  <span>Grid View</span>
                </button>
              </div>

              {/* LetterGlitch Effect Selector */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: 'var(--radius-full)',
                padding: '3px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd', padding: '0 8px', fontWeight: 600 }}>
                  Glitch:
                </span>
                {[
                  { id: 'tear', label: 'Tear' },
                  { id: 'burst', label: 'Burst' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGlitchClickEffect(mode.id)}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: glitchClickEffect === mode.id ? 700 : 500,
                      border: 'none',
                      background: glitchClickEffect === mode.id ? 'rgba(56, 189, 248, 0.3)' : 'transparent',
                      color: glitchClickEffect === mode.id ? '#ffffff' : '#cbd5e1',
                      borderBottom: glitchClickEffect === mode.id ? '1.5px solid #38bdf8' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {destViewMode === 'carousel' ? (
          <div>
            {/* React Bits Circular Carousel Stage */}
            <div style={{
              height: stageHeight,
              width: '100%',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at center, rgba(2, 132, 199, 0.08) 0%, transparent 70%)'
            }}>
              <CircularCarousel
                items={carouselItems}
                preset="cylinder"
                cardWidth={cardWidth}
                aspectRatio={1.05}
                gap={36}
                autoplay="drift"
                speed={10}
                cornerRadius={18}
                depthFade={0.35}
                draggable={true}
                snap={true}
                captions={false}
                onChange={(idx) => setActiveDestIndex(idx)}
                onItemClick={(item) => {
                  if (item.code) navigate(`/flights?destination=${item.code}`);
                }}
              />
            </div>

            {/* Interactive Destination Showcase Card with Aviation Glassmorphism */}
            <div style={{
              maxWidth: '720px',
              margin: '24px auto 0',
              backgroundColor: 'rgba(15, 23, 42, 0.86)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), 0 0 20px rgba(56, 189, 248, 0.15)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(2, 132, 199, 0.25)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  letterSpacing: '0.5px'
                }}>
                  {activeDest.code}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {activeDest.city}
                    </h3>
                    <span className="badge badge-sky" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {activeDest.state}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <MapPin size={13} style={{ color: '#38bdf8' }} />
                    <span>{activeDest.landmark}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Starting from</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                    <CountUp
                      to={activeDest.price}
                      prefix="₹"
                      separator=","
                      duration={1.2}
                    />
                  </div>
                </div>
                <Link
                  to={`/flights?destination=${activeDest.code}`}
                  className="btn btn-accent btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: 700 }}
                >
                  <span>View Flights</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Interaction Hint */}
            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>👆 Drag carousel to spin • Move cursor to glitch letters in real-time • Click anywhere to tear/burst ⚡</span>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {POPULAR_DESTINATIONS.map((dest) => (
              <div key={dest.code} className="destination-card">
                {/* Landmark Photograph Background */}
                <div
                  className="destination-card-bg"
                  style={{ backgroundImage: `url(${dest.image})` }}
                />
                <div className="destination-card-overlay" />

                {/* Card Content */}
                <div className="destination-card-content">
                  <div className="destination-card-top">
                    <span className="destination-state-badge">
                      {dest.state}
                    </span>
                    <span className="destination-code-badge">
                      {dest.code}
                    </span>
                  </div>

                  <div className="destination-card-bottom">
                    <h3 className="destination-card-title">
                      {dest.city}
                    </h3>
                    <div className="destination-card-landmark">
                      <MapPin size={13} style={{ flexShrink: 0 }} />
                      <span>{dest.landmark}</span>
                    </div>

                    <div className="destination-card-action-row">
                      <div>
                        <div className="destination-price-label">Starting from</div>
                        <div className="destination-price-value">
                          <CountUp
                            to={dest.price}
                            prefix="₹"
                            separator=","
                            duration={1.6}
                          />
                        </div>
                      </div>
                      <Link
                        to={`/flights?destination=${dest.code}`}
                        className="destination-btn"
                      >
                        <span>View Flights</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Pick Your Flight - Circular Gallery Section */}
      <section
        style={{
          position: 'relative',
          padding: '36px 0 44px',
          backgroundColor: '#071328',
          overflow: 'hidden',
          borderTop: '1px solid rgba(56, 189, 248, 0.2)'
        }}
      >
        {/* Deep Cosmic Radial Vignette Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center top, rgba(14, 39, 74, 0.85) 0%, rgba(7, 19, 40, 0.95) 60%, #050d1a 100%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            textAlign: 'center'
          }}>
            <h2 style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}>
              Pick Your Flight
            </h2>
            <SplitFlapText
              words={['PICK YOUR FLIGHT', 'RIGHT NOW']}
              charset="alpha"
              tileColor="#0a0a0a"
              textColor="#facc15"
              flipDuration={0.09}
              stagger={0.035}
              flipsPerChar={12}
              fontSize={windowWidth > 1024 ? 36 : windowWidth > 640 ? 28 : 19}
              tileRadius={3}
              gap={3}
              order="random"
              glare={0.75}
              depth={0.85}
              align="center"
              padTo={16}
              cycleDelay={2600}
            />
          </div>

          {/* React Bits Circular Gallery 3D Stage */}
          <div style={{
            height: '420px',
            width: '100%',
            position: 'relative',
            margin: '4px 0 16px',
            borderRadius: 'var(--radius-lg)'
          }}>
            <CircularGallery
              items={GALLERY_ITEMS}
              bend={1.8}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
              itemSize={1}
              itemAspect={0.69}
              gap={0.24}
              wave={1}
              fadeEdges={0.12}
              shadow={0.3}
              grayscale={false}
              showTitles={false}
              snap={true}
              autoScroll={0}
              loop={false}
              scrollDownOnEnd={true}
              openOnClick={false}
              onActiveChange={(idx) => {
                setActiveAirlineIndex(idx);
              }}
              onItemClick={(item) => {
                const targetName = item?.airline?.name || item?.text;
                if (activeAirline.name === targetName) {
                  navigate(`/flights?airline=${encodeURIComponent(targetName)}`);
                }
              }}
            />
          </div>

          {/* Interactive Selected Airline Showcase Card */}
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: `1.5px solid ${activeAirline.primaryColor || 'rgba(56, 189, 248, 0.4)'}`,
            padding: '16px 24px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Carrier Logo Avatar */}
              <div style={{
                width: '72px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px 8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                border: `2px solid ${activeAirline.primaryColor}`,
                overflow: 'hidden'
              }}>
                <img
                  src={activeAirline.logo}
                  alt={activeAirline.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {activeAirline.name}
                  </h3>
                  <span
                    style={{
                      backgroundColor: activeAirline.primaryColor,
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {activeAirline.code}
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.18)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      padding: '2px 8px'
                    }}
                  >
                    ⭐ {activeAirline.rating} Rating
                  </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                  ✈ {activeAirline.aircraftModel} • {activeAirline.tagline}
                </div>
              </div>
            </div>

            {/* Perks & CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fares Starting From
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                  ₹{Number(activeAirline.startingFare).toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/flights?airline=${encodeURIComponent(activeAirline.name)}`)}
                className="btn btn-accent"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <span>Pick & Book {activeAirline.name}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
