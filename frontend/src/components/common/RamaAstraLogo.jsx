import React from 'react';

export default function RamaAstraLogo({ className = '', height = 40 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 100"
      height={height}
      className={className}
      aria-label="RamaAstra Aerospace & Defence"
    >
      {/* Star shape */}
      <g>
        {/* Star outline */}
        <polygon
          points="38,8 44,28 64,28 48,40 54,60 38,48 22,60 28,40 12,28 32,28"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inner star fill */}
        <polygon
          points="38,8 44,28 64,28 48,40 54,60 38,48 22,60 28,40 12,28 32,28"
          fill="#0a0a0a"
          stroke="white"
          strokeWidth="1"
        />
        {/* Swoosh tail */}
        <path
          d="M 12,55 Q 0,65 5,72 Q 20,62 38,48"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 5,72 L 55,68"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* RamaAstra text */}
      <text
        x="72"
        y="46"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="28"
        fill="white"
        letterSpacing="0.5"
      >
        RamaAstra
      </text>

      {/* AEROSPACE & DEFENCE text */}
      <text
        x="73"
        y="64"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize="13"
        fill="#4db8ff"
        letterSpacing="2"
      >
        AEROSPACE &amp; DEFENCE
      </text>

      {/* Underline */}
      <line x1="73" y1="68" x2="290" y2="68" stroke="#4db8ff" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
