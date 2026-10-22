/**
 * Airline Visual Assets & Aircraft Registry
 * Provides local verified commercial airplane imagery, livery branding,
 * aircraft models, and amenity specifications for a clean classic UI.
 */

import airIndiaImg from '../assets/flights/airindia.jpg';
import indigoImg from '../assets/flights/indigo.jpg';
import spicejetImg from '../assets/flights/spicejet.jpg';
import vistaraImg from '../assets/flights/vistara.jpg';
import akasaImg from '../assets/flights/akasa.jpg';

export const AIRLINE_DATA = {
  'Air India': {
    code: 'AI',
    name: 'Air India',
    primaryColor: '#c8102e',
    secondaryColor: '#f7d117',
    badgeBg: '#fef2f2',
    aircraftModel: 'Boeing 787-8 Dreamliner',
    cabinLayout: '3-3-3 Standard Economy',
    image: airIndiaImg,
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
    image: indigoImg,
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
    image: spicejetImg,
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
    image: vistaraImg,
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
    image: akasaImg,
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
    image: indigoImg,
    amenities: ['7kg Cabin Baggage', 'In-flight Refreshments', 'Non-Stop Direct']
  };

  return AIRLINE_DATA[airlineName] || defaultInfo;
};

export default {
  AIRLINE_DATA,
  getAirlineInfo
};
