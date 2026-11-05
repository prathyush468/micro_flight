'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, cubicBezier, useInView } from 'motion/react';

const CountUp = ({
  to,
  from = 0,
  duration = 1.8,
  delay = 0,
  className = '',
  style = {},
  prefix = '',
  suffix = '',
  separator = ',',
  decimals = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(to);
      return;
    }

    const controls = animate(from, to, {
      duration,
      delay,
      ease: cubicBezier(0.33, 1, 0.68, 1),
      onUpdate: (latest) => {
        setDisplayValue(latest);
      }
    });

    return () => controls.stop();
  }, [isInView, from, to, duration, delay]);

  const formatNumber = (val) => {
    const fixed = Number(val).toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const grouped = separator ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : intPart;
    return decPart ? `${grouped}.${decPart}` : grouped;
  };

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export default CountUp;
