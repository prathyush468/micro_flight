'use client';

import React, { useEffect, useRef } from 'react';

const Magnet = ({
  children,
  padding = 40,
  disabled = false,
  magnetStrength = 2.5,
  className = '',
  innerClassName = '',
  style = {},
  ...props
}) => {
  const wrapperRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner || disabled) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const onMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.hypot(distX, distY);

      if (dist < padding + Math.max(rect.width, rect.height) / 2) {
        const pullX = distX / magnetStrength;
        const pullY = distY / magnetStrength;
        inner.style.transform = `translate3d(${pullX.toFixed(2)}px, ${pullY.toFixed(2)}px, 0)`;
        inner.style.transition = 'transform 0.15s ease-out';
      } else {
        inner.style.transform = 'translate3d(0, 0, 0)';
        inner.style.transition = 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
      }
    };

    const onMouseLeave = () => {
      inner.style.transform = 'translate3d(0, 0, 0)';
      inner.style.transition = 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    wrapper.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [disabled, padding, magnetStrength]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
};

export default Magnet;
