import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Bistro Yahya - Dusty Rose & Cream palette
      colors: {
        primary: {
          50: "#ffe9eb",
          100: "#ffe9eb",
          200: "#fcd9dc",
          300: "#fcd9dc",
          400: "#f5c1c5",
          500: "#efb0b7", // Main pink
          600: "#efb0b7",
          700: "#db7c87",
          800: "#db7c87",
          900: "#db7c87",
        },
        cream: {
          50: "#FFFBF7",
          100: "#FFF5ED",
          200: "#FFE8D6",
          300: "#FFD7BA",
          400: "#FFC89E",
          500: "#F5DCC8",
        },
        wine: {
          500: "#9B2C2C",
          600: "#7A2424",
          700: "#5C1C1C",
        },
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
        status: {
          pending: "#F59E0B",
          preparing: "#8B5CF6",
          completed: "#10B981",
          cancelled: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.06)',
        'soft-lg': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'soft-xl': '0 8px 24px 0 rgb(0 0 0 / 0.10)',
        'elegant': '0 4px 20px 0 rgb(166 107 135 / 0.15)',
        'glow': '0 0 20px 0 rgb(166 107 135 / 0.2)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
      },
    },
  },
  plugins: [],
};

export default config;