import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bistro Yahya brand colors - soft pink aesthetic
        primary: {
          50: "#FFF5F9",
          100: "#FFE5F0",
          200: "#FFCCE2",
          300: "#FFB5D8",  // Main soft pink
          400: "#FF99C8",
          500: "#FF7DB8",
          600: "#E6609D",
          700: "#CC4482",
          800: "#992D5F",
          900: "#661D3F",
        },
        // Neutral tones for backgrounds and text
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        // Accent dusty pink (from cafe photo)
        dusty: {
          100: "#F4E4E8",
          200: "#E8C9D1",
          300: "#D4A9B5",  // Dusty mauve from walls
          400: "#C08999",
          500: "#A8697A",
        },
        // Status colors
        status: {
          pending: "#FCD34D",    // Warm yellow
          preparing: "#FB923C",  // Warm orange  
          completed: "#86EFAC",  // Soft green
          cancelled: "#FCA5A5",  // Soft red
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.1)',
        'pink-glow': '0 0 20px rgba(255, 181, 216, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
