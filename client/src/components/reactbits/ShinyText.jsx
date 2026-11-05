import React from 'react';
import './ShinyText.css';

const ShinyText = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
  color = 'inherit',
  shineColor = 'rgba(255, 255, 255, 0.9)',
  style = {}
}) => {
  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        '--shiny-speed': `${speed}s`,
        '--shiny-base': color,
        '--shiny-highlight': shineColor,
        ...style
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
