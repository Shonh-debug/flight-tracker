/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Glass-themed dark/light mode palette
        glass: {
          bg: 'var(--bg-primary)',
          surface: 'var(--bg-secondary)',
          card: 'var(--bg-glass)',
          border: 'var(--border-glass)',
          glow: 'var(--border-glow)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
          muted: 'var(--accent-muted)',
        },
        ft: {
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          accent: 'var(--accent)',
        },
        // Status colors (same in both modes)
        status: {
          active: '#3b82f6',
          scheduled: '#64748b',
          landed: '#22c55e',
          delayed: '#f59e0b',
          cancelled: '#ef4444',
          diverted: '#a855f7',
          incident: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px var(--accent-muted), inset 0 0 15px var(--accent-muted)' },
          '50%': { boxShadow: '0 0 30px var(--accent-muted), inset 0 0 30px var(--accent-muted)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'var(--border-glass)' },
          '50%': { borderColor: 'var(--border-glow)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px var(--accent-muted)',
        'glow': '0 0 20px var(--accent-muted)',
        'glow-lg': '0 0 40px var(--accent-muted)',
        'glow-accent': '0 0 20px var(--accent)',
        'inner-glow': 'inset 0 0 20px var(--accent-muted)',
      },
    },
  },
  plugins: [],
}
