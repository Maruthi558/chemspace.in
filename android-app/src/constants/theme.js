/**
 * ChemSpace Mobile Theme Tokens
 * Direct mirror of web frontend CSS design system in src/index.css:
 * Precision Obsidian & Graphite optical bench palette with high-impact accents.
 */

export const THEME = {
  // Surfaces & Backgrounds
  bgPage: '#0A0C10',       // Obsidian bench
  bgCard: '#121520',       // Graphite monolith
  bgCardLight: '#181C2B',  // Elevated surface
  bgInput: '#10131D',      // Deep input surface
  bgSidebar: '#0E1017',    // Bottom bar & modals

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderMedium: 'rgba(255, 255, 255, 0.16)',
  borderStrong: 'rgba(255, 255, 255, 0.28)',
  borderFocus: '#F97316',

  // Typography Hierarchy
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDim: '#475569',
  textInverse: '#0A0C10',

  // Scientific Accents
  accentOrange: '#F97316',
  accentOrangeHover: '#EA580C',
  accentOrangeSubtle: 'rgba(249, 115, 22, 0.15)',
  accentOrangeBorder: 'rgba(249, 115, 22, 0.40)',

  accentEmerald: '#10B981',
  accentEmeraldHover: '#059669',
  accentEmeraldSubtle: 'rgba(16, 185, 129, 0.15)',
  accentEmeraldBorder: 'rgba(16, 185, 129, 0.35)',

  accentCyan: '#06B6D4',
  accentCyanSubtle: 'rgba(6, 182, 212, 0.15)',

  accentPurple: '#A855F7',
  accentPurpleSubtle: 'rgba(168, 85, 247, 0.15)',

  accentRed: '#EF4444',
  accentRedSubtle: 'rgba(239, 68, 68, 0.15)',

  // Shadows
  shadowCard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowHighlight: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  }
};
