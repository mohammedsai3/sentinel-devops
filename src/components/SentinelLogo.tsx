import React from 'react';

interface SentinelLogoProps {
  size?: number;
  className?: string;
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({
  size = 20,
  className = 'text-emerald-400',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Geometric telemetry prism / watchtower shield */}
      <path
        d="M12 2.5L20 7V17L12 21.5L4 17V7L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="opacity-50"
      />
      {/* Focal diamond aperture */}
      <path
        d="M12 7L16 12L12 17L8 12L12 7Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Active telemetry kernel point */}
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
};
