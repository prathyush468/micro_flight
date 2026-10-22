import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingConfirmation from './BookingConfirmation';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // If ID is provided, route directly to BookingConfirmation which renders the full details
  return <BookingConfirmation />;
};

export default BookingDetails;
