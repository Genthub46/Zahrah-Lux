
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "100%" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: size, width: 'auto' }}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8C6E33' }} />
          <stop offset="50%" style={{ stopColor: '#C5A059' }} />
          <stop offset="100%" style={{ stopColor: '#E2C285' }} />
        </linearGradient>
      </defs>

      {/* Outer Glow/Ring */}
      <circle cx="100" cy="110" r="65" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.5" />

      {/* Laurel Wreaths */}
      <g stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        {/* Left Wreath */}
        <path d="M60 145C45 130 45 90 60 75" fill="none" />
        {[75, 90, 105, 120, 135].map((y, i) => (
          <path key={`l-${i}`} d={`M55 ${y} L45 ${y - 5}`} />
        ))}
        {/* Right Wreath */}
        <path d="M140 145C155 130 155 90 140 75" fill="none" />
        {[75, 90, 105, 120, 135].map((y, i) => (
          <path key={`r-${i}`} d={`M145 ${y} L155 ${y - 5}`} />
        ))}
      </g>

      {/* Crown Top */}
      <g fill="url(#goldGradient)">
        <path d="M80 55 L75 40 L90 48 L100 35 L110 48 L125 40 L120 55 H80Z" />
        <circle cx="75" cy="38" r="2" />
        <circle cx="100" cy="33" r="2.5" />
        <circle cx="125" cy="38" r="2" />
      </g>

      {/* Main Circles */}
      <circle cx="100" cy="110" r="55" stroke="url(#goldGradient)" strokeWidth="2.5" />
      <circle cx="100" cy="110" r="50" stroke="url(#goldGradient)" strokeWidth="1" />

      {/* ZL Monogram */}
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fill="url(#goldGradient)"
        style={{ fontSize: '42px', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}
      >
        ZL
      </text>

      {/* Arc Texts */}
      <defs>
        <path id="topArc" d="M65 110 A 35 35 0 0 1 135 110" />
        <path id="bottomArc" d="M65 125 A 35 35 0 0 0 135 125" />
      </defs>

      <text fill="url(#goldGradient)" style={{ fontSize: '8px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Inter' }}>
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">ZARHRAH</textPath>
      </text>

      <text fill="url(#goldGradient)" style={{ fontSize: '8px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Inter' }}>
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">LUXURY</textPath>
      </text>

      {/* Collections Banner at Bottom */}
      <path d="M60 155 Q100 175 140 155" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
      <text x="100" y="166" textAnchor="middle" fill="white" style={{ fontSize: '7px', fontWeight: '900', letterSpacing: '1px', fontFamily: 'Inter' }}>
        COLLECTIONS
      </text>
    </svg>
  );
};

export default Logo;