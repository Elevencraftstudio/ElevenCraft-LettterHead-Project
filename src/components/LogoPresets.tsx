/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoPresetProps {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
  id?: string;
}

export const LOGO_PRESETS = [
  { id: 'hexagon', name: 'HexaCore Systems', description: 'Tech, security, structure' },
  { id: 'triad', name: 'Aura Poly', description: 'Consulting, marketing, creativity' },
  { id: 'delta', name: 'Apex Zenith', description: 'Science, finance, acceleration' },
  { id: 'infinity', name: 'Symmetry Loop', description: 'Design, standard, coordination' },
  { id: 'crown', name: 'Regal Crest', description: 'Premium, law, hospitality' },
  { id: 'grid', name: 'Studio Align', description: 'Architecture, engineering, logistics' }
];

export const LogoPreset: React.FC<LogoPresetProps> = ({
  name,
  primaryColor,
  secondaryColor,
  className = "w-12 h-12"
}) => {
  // Use colors as safe fallback properties
  const stroke1 = primaryColor;
  const stroke2 = secondaryColor || primaryColor;

  switch (name) {
    case 'hexagon':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke={stroke1} strokeWidth="8" strokeLinejoin="round" fill="none" />
          <polygon points="50,22 80,38 80,62 50,78 20,62 20,38" stroke={stroke2} strokeWidth="4" strokeLinejoin="round" fill="none" opacity="0.8" />
          <polygon points="50,35 68,45 68,55 50,65 32,55 32,45" fill={stroke1} />
        </svg>
      );
    case 'triad':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="50" cy="38" r="24" stroke={stroke1} strokeWidth="8" fill="none" />
          <circle cx="34" cy="66" r="24" stroke={stroke2} strokeWidth="8" fill="none" opacity="0.9" />
          <circle cx="66" cy="66" r="24" stroke={stroke1} strokeWidth="8" fill="none" opacity="0.75" />
          <circle cx="50" cy="54" r= "6" fill={stroke2} />
        </svg>
      );
    case 'delta':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M50 15 L88 80 L12 80 Z" stroke={stroke1} strokeWidth="8" strokeLinejoin="round" fill="none" />
          <path d="M50 35 L72 73 L28 73 Z" fill={stroke2} />
          <circle cx="50" cy="54" r="8" fill="#ffffff" />
        </svg>
      );
    case 'infinity':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M30,35 C15,35 15,65 30,65 C45,65 55,35 70,35 C85,35 85,65 70,65 C55,65 45,35 30,35 Z" stroke={stroke1} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M30,35 C15,35 15,65 30,65 C45,65 55,35 70,35" stroke={stroke2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
          <circle cx="30" cy="50" r="4" fill={stroke1} />
          <circle cx="70" cy="50" r="4" fill={stroke2} />
        </svg>
      );
    case 'crown':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M15,75 L25,40 L42,55 L50,25 L58,55 L75,40 L85,75 Z" stroke={stroke1} strokeWidth="7" strokeLinejoin="round" fill="none" />
          <path d="M22,70 L28,48 L41,60 L50,35 L59,60 L72,48 L78,70 Z" fill={stroke2} opacity="0.8" />
          <line x1="10" y1="83" x2="90" y2="83" stroke={stroke1} strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="20" r="4.5" fill={stroke1} />
          <circle cx="25" cy="34" r="3.5" fill={stroke2} />
          <circle cx="75" cy="34" r="3.5" fill={stroke2} />
        </svg>
      );
    case 'grid':
    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="15" y="15" width="70" height="70" rx="4" stroke={stroke1} strokeWidth="8" fill="none" />
          <line x1="15" y1="50" x2="85" y2="50" stroke={stroke2} strokeWidth="4" strokeDasharray="6 4" />
          <line x1="50" y1="15" x2="50" y2="85" stroke={stroke2} strokeWidth="4" strokeDasharray="6 4" />
          <rect x="35" y="35" width="30" height="30" fill={stroke1} rx="2" />
          <circle cx="50" cy="50" r="5" fill="#ffffff" />
        </svg>
      );
  }
};
