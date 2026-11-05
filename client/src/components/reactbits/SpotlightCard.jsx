'use client';

import React, { useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = ({
  children,
  className = '',
  style = {},
  spotlightColor = 'rgba(2, 132, 199, 0.16)',
  spotlightSize = 340,
  ...rest
}) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--spotlight-x', `${x}px`);
    divRef.current.style.setProperty('--spotlight-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-opacity', '1');
  };

  const handleMouseLeave = () => {
    if (!divRef.current) return;
    divRef.current.style.setProperty('--spotlight-opacity', '0');
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={{
        '--spotlight-color': spotlightColor,
        '--spotlight-size': `${spotlightSize}px`,
        ...style
      }}
      {...rest}
    >
      <div className="spotlight-card__light" aria-hidden="true" />
      <div className="spotlight-card__border" aria-hidden="true" />
      <div className="spotlight-card__content">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
