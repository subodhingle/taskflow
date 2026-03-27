import React from 'react';

export default function RamaAstraLogo({ className = '', height = 48 }) {
  const width = height * 2.8;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 100"
      height={height}
      width={width}
      className={className}
      aria-label="RamaAstra Aerospace & Defence"
    >
      {/* ── Star + swoosh ── */}
      {/* Star body — white filled with black cutout center */}
      <polygon
        points="44,4 50,26 72,26 55,39 61,61 44,48 27,61 33,39 16,26 38,26"
        fill="white"
      />
      {/* Black inner cutout to create hollow star effect */}
      <polygon
        points="44,12 48,28 62,28 51,36 55,50 44,42 33,50 37,36 26,28 40,28"
        fill="black"
      />

      {/* Swoosh tail — bottom left going right */}
      <path
        d="M 16,52 Q 4,64 8,70 L 72,64"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Second swoosh line (thinner) */}
      <path
        d="M 8,70 L 80,66"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* ── RamaAstra text ── */}
      <text
        x="78"
        y="44"
        fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
        fontWeight="900"
        fontSize="30"
        fill="white"
        letterSpacing="0.3"
      >
        RamaAstra
      </text>

      {/* ── AEROSPACE & DEFENCE ── */}
      <text
        x="79"
        y="62"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="12.5"
        fill="#38b6ff"
        letterSpacing="1.8"
      >
        AEROSPACE &amp; DEFENCE
      </text>
    </svg>
  );
}
