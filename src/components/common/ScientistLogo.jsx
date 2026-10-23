import React from 'react';

/**
 * Intelligent Scientist Gender & Identity Inference
 * Inspects name or email to auto-detect Male vs Female Scientist persona,
 * while allowing user to manually override.
 */
export function inferScientistGender(nameOrEmail = '') {
  if (!nameOrEmail || typeof nameOrEmail !== 'string') return 'male';

  const clean = nameOrEmail.toLowerCase().trim();

  // Explicit title checks
  if (/\b(ms|mrs|miss|madam|madame|lady|she|her)\b/i.test(clean)) return 'female';
  if (/\b(mr|sir|lord|gentleman|he|him|his)\b/i.test(clean)) return 'male';

  // Female chemistry pioneers & common female names/prefixes
  const femaleKeywords = [
    'marie', 'curie', 'rosalind', 'franklin', 'dorothy', 'hodgkin', 'ada', 'yonath',
    'elena', 'priya', 'sophie', 'lin', 'emma', 'sarah', 'rachel', 'anna', 'laura',
    'jessica', 'clara', 'lise', 'meitner', 'irene', 'joliot', 'chidi', 'fatima',
    'aisha', 'ananya', 'pooja', 'kavya', 'divya', 'sneha', 'swathi', 'neha', 'maya',
    'emily', 'hannah', 'chloe', 'olivia', 'maria', 'elizabeth', 'victoria', 'eva',
    'amanda', 'grace', 'mary', 'alice', 'rose', 'helen', 'carol', 'donna', 'ruth',
    'karen', 'sharon', 'deborah', 'cynthia', 'rebecca', 'kimberly', 'stephanie'
  ];

  for (const kw of femaleKeywords) {
    if (clean.includes(kw)) return 'female';
  }

  // Common male keywords/names
  const maleKeywords = [
    'maruthi', 'marcus', 'arthur', 'sterling', 'david', 'chen', 'vance', 'mendeleev',
    'bohr', 'einstein', 'feynman', 'newton', 'dalton', 'lavoisier', 'rutherford',
    'john', 'robert', 'michael', 'william', 'james', 'thomas', 'charles', 'george',
    'joseph', 'daniel', 'paul', 'mark', 'donald', 'steven', 'andrew', 'kenneth',
    'joshua', 'kevin', 'brian', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey',
    'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry',
    'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory', 'alexander',
    'rahul', 'rohit', 'suresh', 'ramesh', 'amit', 'vikram', 'arjun', 'rajesh'
  ];

  for (const kw of maleKeywords) {
    if (clean.includes(kw)) return 'male';
  }

  return 'male';
}

/**
 * Male Scientist Vector Emblem & Official Logo
 * Features a high-tech male chemist with safety goggles, lab coat,
 * benzene ring, and chemical flask with glowing cyan/amber cyber accents.
 */
export function MaleScientistLogo({ size = 48, className = '', showGlow = true }) {
  const s = typeof size === 'number' ? size : 48;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="Male Scientist Official ChemSpace Logo"
    >
      <defs>
        <radialGradient id="ms-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="ms-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="ms-coat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="ms-goggles" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="ms-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Cyber Shield Ring */}
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="url(#ms-bg)"
        stroke="url(#ms-ring)"
        strokeWidth="2.5"
        filter={showGlow ? 'url(#ms-glow)' : undefined}
      />

      {/* Orbit Ring Accent with Electron Dots */}
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="18"
        stroke="#38bdf8"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.6"
        transform="rotate(-25 50 50)"
      />
      <circle cx="20" cy="38" r="2" fill="#38bdf8" />
      <circle cx="80" cy="62" r="2" fill="#f59e0b" />

      {/* Lab Coat Shoulders */}
      <path
        d="M20 90 C 22 74, 34 68, 50 68 C 66 68, 78 74, 80 90 Z"
        fill="url(#ms-coat)"
      />

      {/* Lab Coat Collar & Tie */}
      <path d="M42 68 L50 78 L58 68 Z" fill="#0f172a" />
      <path d="M48 74 L50 85 L52 74 Z" fill="#0284c7" />
      <path d="M42 68 L36 82 L44 82 Z" fill="#e2e8f0" opacity="0.9" />
      <path d="M58 68 L64 82 L56 82 Z" fill="#e2e8f0" opacity="0.9" />

      {/* Neck */}
      <rect x="44" y="58" width="12" height="12" rx="2" fill="#fed7aa" />

      {/* Male Scientist Head / Face */}
      <path
        d="M36 44 C 36 33, 42 26, 50 26 C 58 26, 64 33, 64 44 C 64 54, 58 60, 50 60 C 42 60, 36 54, 36 44 Z"
        fill="#fed7aa"
      />

      {/* Short Trim Professional Haircut */}
      <path
        d="M34 40 C 34 26, 40 20, 50 20 C 60 20, 66 26, 66 40 C 64 33, 60 30, 50 29 C 40 28, 36 34, 34 40 Z"
        fill="#334155"
      />

      {/* High-Tech Chemist Safety Goggles */}
      <rect x="37" y="38" width="11" height="8" rx="2.5" fill="url(#ms-goggles)" stroke="#0284c7" strokeWidth="1" />
      <rect x="52" y="38" width="11" height="8" rx="2.5" fill="url(#ms-goggles)" stroke="#0284c7" strokeWidth="1" />
      <rect x="47" y="41" width="6" height="2" fill="#0f172a" />
      {/* Goggle Lens Reflection */}
      <line x1="39" y1="39" x2="43" y2="44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      <line x1="54" y1="39" x2="58" y2="44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />

      {/* Smile / Mouth */}
      <path d="M46 54 Q50 57 54 54" stroke="#78350f" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Chemistry Flask Icon Badge in Corner */}
      <g transform="translate(66, 60) scale(0.65)">
        <circle cx="20" cy="20" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <path
          d="M18 10 L22 10 L22 15 L26 24 C 27 26, 26 28, 23 28 L17 28 C 14 28, 13 26, 14 24 L18 15 Z"
          fill="#38bdf8"
          opacity="0.8"
        />
        <circle cx="20" cy="22" r="1.5" fill="#ffffff" />
        <circle cx="18" cy="25" r="1" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * Female Scientist Vector Emblem & Official Logo
 * Features an accomplished female chemist with protective goggles, lab coat,
 * DNA helix/benzene ring, and Florence flask with glowing emerald/magenta cyber accents.
 * Designed in devotion to pioneering women in chemistry (Curie, Franklin, Hodgkin).
 */
export function FemaleScientistLogo({ size = 48, className = '', showGlow = true }) {
  const s = typeof size === 'number' ? size : 48;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="Female Scientist Official ChemSpace Logo"
    >
      <defs>
        <radialGradient id="fs-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#1e1b4b" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="fs-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="fs-coat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="fs-goggles" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="fs-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Cyber Shield Ring */}
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="url(#fs-bg)"
        stroke="url(#fs-ring)"
        strokeWidth="2.5"
        filter={showGlow ? 'url(#fs-glow)' : undefined}
      />

      {/* DNA Double Helix / Planetary Orbit Ring */}
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="18"
        stroke="#10b981"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        opacity="0.6"
        transform="rotate(25 50 50)"
      />
      <circle cx="80" cy="38" r="2" fill="#10b981" />
      <circle cx="20" cy="62" r="2" fill="#ec4899" />

      {/* Lab Coat Shoulders */}
      <path
        d="M20 90 C 22 74, 34 68, 50 68 C 66 68, 78 74, 80 90 Z"
        fill="url(#fs-coat)"
      />

      {/* Lab Coat V-Neck & Emerald Scarf / Lapel */}
      <path d="M42 68 L50 80 L58 68 Z" fill="#064e3b" />
      <path d="M47 73 L50 86 L53 73 Z" fill="#10b981" />
      <path d="M42 68 L35 83 L43 83 Z" fill="#f8fafc" opacity="0.9" />
      <path d="M58 68 L65 83 L57 83 Z" fill="#f8fafc" opacity="0.9" />

      {/* Slender Neck */}
      <rect x="45" y="58" width="10" height="12" rx="2" fill="#fed7aa" />

      {/* Female Scientist Head / Face */}
      <path
        d="M37 44 C 37 33, 42 27, 50 27 C 58 27, 63 33, 63 44 C 63 54, 58 60, 50 60 C 42 60, 37 54, 37 44 Z"
        fill="#fed7aa"
      />

      {/* Elegant Hair Tied / Lab Style Hair */}
      {/* Top and side swept hair */}
      <path
        d="M33 42 C 32 26, 40 18, 50 18 C 60 18, 68 26, 67 42 C 67 49, 64 54, 64 54 C 62 46, 61 36, 50 31 C 39 36, 38 46, 36 54 C 36 54, 33 49, 33 42 Z"
        fill="#475569"
      />
      {/* Scientist Bun at top-back */}
      <circle cx="50" cy="18" r="7" fill="#334155" />

      {/* High-Tech Chemist Safety Goggles */}
      <rect x="38" y="38" width="11" height="8" rx="2.5" fill="url(#fs-goggles)" stroke="#059669" strokeWidth="1" />
      <rect x="51" y="38" width="11" height="8" rx="2.5" fill="url(#fs-goggles)" stroke="#059669" strokeWidth="1" />
      <rect x="48" y="41" width="4" height="2" fill="#0f172a" />
      {/* Goggle Lens Reflection */}
      <line x1="40" y1="39" x2="44" y2="44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      <line x1="53" y1="39" x2="57" y2="44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />

      {/* Warm Smile / Lips */}
      <path d="M46 54 Q50 57.5 54 54" stroke="#be185d" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Round Florence Flask / DNA Helix Badge in Corner */}
      <g transform="translate(66, 60) scale(0.65)">
        <circle cx="20" cy="20" r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        <path
          d="M18 10 L22 10 L22 16 C 24 16, 27 19, 27 23 C 27 27, 24 29, 20 29 C 16 29, 13 27, 13 23 C 13 19, 16 16, 18 16 Z"
          fill="#10b981"
          opacity="0.85"
        />
        <circle cx="20" cy="23" r="1.5" fill="#ffffff" />
        <circle cx="17" cy="25" r="1" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * Unified Scientist Avatar Component
 * Handles rendering the appropriate Male vs Female Scientist Logo,
 * responsive size tokens, and optional badge display.
 */
export default function ScientistAvatar({
  user,
  gender,
  size = 'md',
  className = '',
  showBadge = false,
  onClick
}) {
  const effectiveGender = gender || user?.scientistType || inferScientistGender(user?.name || user?.email || '');

  const sizeMap = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 68
  };

  const px = sizeMap[size] || 36;
  const isFemale = effectiveGender === 'female';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
      title={`${isFemale ? 'Female' : 'Male'} Scientist • ChemSpace Fellow`}
    >
      {isFemale ? (
        <FemaleScientistLogo size={px} />
      ) : (
        <MaleScientistLogo size={px} />
      )}

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 text-[9px] px-1 py-0.2 rounded-full border font-mono font-bold leading-none ${
            isFemale
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400'
              : 'bg-cyan-950/90 text-cyan-300 border-cyan-400'
          }`}
        >
          {isFemale ? '👩‍🔬' : '👨‍🔬'}
        </span>
      )}
    </div>
  );
}
