/**
 * Airline Visual Assets & Aircraft Registry
 * Provides high-resolution commercial airplane imagery, livery branding,
 * aircraft models, and amenity specifications for a clean classic UI.
 */

export const AIRLINE_DATA = {
  'Air India': {
    code: 'AI',
    name: 'Air India',
    primaryColor: '#c8102e',
    secondaryColor: '#f7d117',
    badgeBg: '#fef2f2',
    aircraftModel: 'Boeing 787-8 Dreamliner',
    cabinLayout: '3-3-3 Standard Economy',
    // Clean, high-resolution commercial aircraft in flight
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%23c8102e"><rect width="400" height="240" fill="%23fff5f5"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%23c8102e"/><circle cx="340" cy="95" r="8" fill="%23f7d117"/></svg>`,
    amenities: ['Free Meal Included', 'USB Charging Port', '7kg Cabin + 15kg Check-in']
  },
  'IndiGo': {
    code: '6E',
    name: 'IndiGo',
    primaryColor: '#001b94',
    secondaryColor: '#0072ce',
    badgeBg: '#eff6ff',
    aircraftModel: 'Airbus A320neo',
    cabinLayout: '3-3 Slimline Seating',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%23001b94"><rect width="400" height="240" fill="%23f0f7ff"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%23001b94"/></svg>`,
    amenities: ['On-time Performance', 'Pre-book Snacks', '7kg Cabin Baggage']
  },
  'SpiceJet': {
    code: 'SG',
    name: 'SpiceJet',
    primaryColor: '#d8232a',
    secondaryColor: '#f99f1b',
    badgeBg: '#fff1f2',
    aircraftModel: 'Boeing 737-800 Next-Gen',
    cabinLayout: '3-3 SpiceMax Optional',
    image: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%23d8232a"><rect width="400" height="240" fill="%23fff5f5"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%23d8232a"/><polygon points="340,90 355,80 370,95" fill="%23f99f1b"/></svg>`,
    amenities: ['Hot Meals On-Demand', 'Extra Legroom Seats', '7kg Cabin + 15kg Check-in']
  },
  'Vistara': {
    code: 'UK',
    name: 'Vistara',
    primaryColor: '#531b4d',
    secondaryColor: '#d4af37',
    badgeBg: '#faf5ff',
    aircraftModel: 'Airbus A321neo Long Range',
    cabinLayout: '3-3 Premium Leather',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%23531b4d"><rect width="400" height="240" fill="%23faf5ff"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%23531b4d"/></svg>`,
    amenities: ['Complimentary Gourmet Meal', 'Wireless Entertainment', '7kg Cabin + 15kg Check-in']
  },
  'Akasa Air': {
    code: 'QP',
    name: 'Akasa Air',
    primaryColor: '#f35a24',
    secondaryColor: '#6f2c91',
    badgeBg: '#fff7ed',
    aircraftModel: 'Boeing 737 MAX 8',
    cabinLayout: '3-3 Ultra-modern SkyInterior',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%23f35a24"><rect width="400" height="240" fill="%23fff7ed"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%23f35a24"/></svg>`,
    amenities: ['Eco-friendly Quiet Flight', 'Cafe Akasa Gourmet', 'USB Fast Charging']
  }
};

/**
 * Returns complete visual assets for an airline
 */
export const getAirlineInfo = (airlineName) => {
  const defaultInfo = {
    code: 'SB',
    name: airlineName || 'Commercial Airline',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    badgeBg: '#f0f9ff',
    aircraftModel: 'Airbus A320neo / Boeing 737',
    cabinLayout: '3-3 Standard Economy',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=720&q=80',
    fallbackSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" fill="%230284c7"><rect width="400" height="240" fill="%23f0f9ff"/><path d="M40 140 L220 100 L360 110 L380 95 L375 125 L240 145 L150 200 L125 195 L160 145 L70 145 L45 165 L35 160 Z" fill="%230284c7"/></svg>`,
    amenities: ['7kg Cabin Baggage', 'In-flight Refreshments', 'Non-Stop Direct']
  };

  return AIRLINE_DATA[airlineName] || defaultInfo;
};

export default {
  AIRLINE_DATA,
  getAirlineInfo
};
