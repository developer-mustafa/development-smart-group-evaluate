import React from 'react';
import { toBanglaNumber } from '../utils/rankingUtils';

const CircularMeter = ({ percent, palette, size = 72 }) => {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const background = 'conic-gradient(' + palette.solid + ' ' + clamped + '%, rgba(0,0,0,0.08) ' + clamped + '% 100%)';
  const filter = 'drop-shadow(0 6px 16px ' + palette.shadow + ')';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: background,
          filter: filter,
        }}
      />
      <div className="absolute inset-[18%] rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-inner">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {toBanglaNumber(clamped.toFixed(2))}%
        </span>
      </div>
    </div>
  );
};

export default CircularMeter;
