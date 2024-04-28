import React from 'react';

const LoadingAnimation = ({ size = 50, stroke = 4, speed = 2, color = 'black' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LoadingAnimation;
