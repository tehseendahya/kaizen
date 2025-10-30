import * as React from 'react';

type Props = {
  size?: number;
  className?: string;
};

export default function IconAxis({ size = 20, className = '' }: Props) {
  const stroke = '#0B1E3F';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Orbit ring */}
      <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="2.2" />
      {/* Accent dot */}
      <circle cx="6.2" cy="17.8" r="2" fill="#2563EB" />
      {/* Core */}
      <circle cx="12" cy="12" r="2.6" fill={stroke} />
    </svg>
  );
}

