// ═══════════════════════════════════════════════════════
// SoleMate v2.0 — Design System Tokens
// Inspired by kernel.sh — Deep black, precise typography, premium feel
// ═══════════════════════════════════════════════════════

export const colors = {
  // Backgrounds
  bg: '#050507',           // Near-black (kernel.sh style)
  bgAlt: '#0A0A0F',       // Slightly lighter
  surface: '#0C0C12',      // Card backgrounds
  surfaceHover: '#181824', // Card hover
  surfaceActive: '#1E1E2E',

  // Borders
  border: '#1A1A2A',
  borderHover: '#2A2A40',
  borderAccent: '#7C5CFC33',

  // Brand
  accent: '#7C5CFC',
  accentHover: '#6B4EE8',
  accentMuted: '#7C5CFC22',
  accentGlow: 'rgba(124, 92, 252, 0.15)',

  // Semantic
  green: '#00E59B',
  greenMuted: '#00E59B22',
  red: '#FF4757',
  orange: '#FF9F43',
  blue: '#3B82F6',

  // Text
  text: '#E8E8ED',
  textSecondary: '#8888A0',
  textMuted: '#44445A',
  textAccent: '#A78BFA',

  // Gradients
  gradientPurple: 'linear-gradient(135deg, #7C5CFC 0%, #A78BFA 100%)',
  gradientGreen: 'linear-gradient(135deg, #00E59B 0%, #34D399 100%)',
  gradientHero: 'linear-gradient(135deg, #7C5CFC 0%, #00E59B 50%, #3B82F6 100%)',
} as const;

export const fonts = {
  heading: "'DM Sans', sans-serif",
  body: "'Figtree', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
  cardHover: '0 4px 30px rgba(124, 92, 252, 0.12), 0 1px 3px rgba(0,0,0,0.3)',
  glow: '0 0 40px rgba(124, 92, 252, 0.15)',
  button: '0 2px 10px rgba(124, 92, 252, 0.3)',
} as const;
