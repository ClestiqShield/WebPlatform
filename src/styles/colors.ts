/**
 * Clestiq Shield Color System
 * Unified color palette for consistent theming across the application
 * Based on a dark green aesthetic with glassmorphism elements
 */

export const colors = {
    // Green Palette - Primary Brand Colors
    green: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
    },

    // Rich Dark Backgrounds
    richBlack: '#020403',
    deepGreen: '#011c15',

    // Semantic Color Tokens
    primary: '#10b981', // green-500
    primaryForeground: '#ffffff',
    primaryHover: '#059669', // green-600

    secondary: '#064e3b', // green-900
    secondaryForeground: '#d1fae5', // green-100

    accent: '#10b981', // green-500
    accentForeground: '#ffffff',

    // Backgrounds
    background: '#020403', // richBlack
    foreground: '#ecfdf5', // green-50

    // Card & Surface Colors
    card: 'rgba(2, 44, 34, 0.4)', // Glassy green-black
    cardForeground: '#e2e8f0',

    // Muted/Subtle Elements
    muted: 'rgba(255, 255, 255, 0.05)',
    mutedForeground: '#94a3b8',

    // Borders & Inputs
    border: 'rgba(52, 211, 153, 0.2)', // green-400 with opacity
    input: 'rgba(255, 255, 255, 0.1)',
    ring: '#10b981', // green-500

    // State Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#34d399',
} as const;

// Glassmorphism styles
export const glassStyles = {
    default: {
        backgroundColor: 'rgba(2, 44, 34, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(52, 211, 153, 0.1)',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
} as const;

// Background gradients
export const backgroundGradients = {
    main: `
    radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 60%),
    radial-gradient(circle at 90% 90%, rgba(5, 150, 105, 0.1), transparent 50%)
  `,
} as const;

export type ColorKey = keyof typeof colors;
