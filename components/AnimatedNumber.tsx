import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;
    
    // Always start from 0 when value changes
    setDisplayValue(0);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuart (starts fast, slows down at the end)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
};
