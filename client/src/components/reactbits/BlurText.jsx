'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const BlurText = ({
  as: Component = 'div',
  text = '',
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = [0.33, 1, 0.68, 1],
  onAnimationComplete,
  stepDuration = 0.35,
  blur = 8,
  distance = 18,
  trigger = 'view',
  style = {}
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(trigger === 'load');
  const ref = useRef(null);

  useEffect(() => {
    if (trigger !== 'view' || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, trigger]);

  const isReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const defaultFrom = isReduced
    ? { opacity: 0 }
    : direction === 'top'
      ? { filter: `blur(${blur}px)`, opacity: 0, transform: `translate3d(0,-${distance}px,0)` }
      : { filter: `blur(${blur}px)`, opacity: 0, transform: `translate3d(0,${distance}px,0)` };

  const defaultTo = isReduced
    ? { opacity: 1 }
    : [
        {
          filter: `blur(${blur / 2}px)`,
          opacity: 0.7,
          transform: direction === 'top' ? `translate3d(0,${distance * 0.08}px,0)` : `translate3d(0,-${distance * 0.08}px,0)`
        },
        { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' }
      ];

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: style.textAlign === 'center' ? 'center' : 'flex-start',
        gap: animateBy === 'words' ? '0.28em' : '0',
        ...style
      }}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={animationFrom || defaultFrom}
          animate={inView ? (animationTo || defaultTo) : (animationFrom || defaultFrom)}
          transition={{
            duration: isReduced ? 0.01 : stepDuration,
            delay: isReduced ? 0 : (index * delay) / 1000,
            ease: easing
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          style={{
            display: 'inline-block',
            willChange: 'transform, filter, opacity',
            whiteSpace: 'pre'
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
        </motion.span>
      ))}
    </Component>
  );
};

export default BlurText;
