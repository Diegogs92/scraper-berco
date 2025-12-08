/**
 * Font Configuration
 *
 * Uncomment the font you want to use and update the export at the bottom.
 * All fonts are from Google Fonts and optimized for web performance.
 */

import {
  Inter,
  Poppins,
  Space_Grotesk,
  Outfit,
  Plus_Jakarta_Sans,
  Manrope,
  DM_Sans,
  Work_Sans,
  Nunito_Sans,
  Rubik
} from 'next/font/google';

// ====================
// MODERN & CLEAN FONTS
// ====================

// Inter - Very popular, excellent readability (Default in many apps)
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Poppins - Modern, geometric, great for headings
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Space Grotesk - Current font, modern and stylish
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Outfit - Clean, geometric, very modern
export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Plus Jakarta Sans - Professional, rounded, great for UI
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ====================
// PROFESSIONAL FONTS
// ====================

// Manrope - Clean, professional, excellent for dashboards
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// DM Sans - Modern, professional, great for data-heavy UIs
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// Work Sans - Versatile, clean, great for body text
export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ====================
// FRIENDLY & ROUNDED FONTS
// ====================

// Nunito Sans - Friendly, rounded, excellent readability
export const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

// Rubik - Friendly, slightly rounded, modern
export const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ====================
// ACTIVE FONT
// ====================
// Change this to use a different font throughout the app
export const activeFont = plusJakartaSans;

/**
 * Font Recommendations:
 *
 * - Inter: Best for data-heavy dashboards, excellent readability
 * - Poppins: Great if you want a more modern, bold look
 * - Outfit: Very clean and modern, similar to Space Grotesk
 * - Plus Jakarta Sans: Professional with a friendly touch
 * - Manrope: Perfect for professional business dashboards
 * - DM Sans: Excellent for analytics and data visualization
 */
