/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ============================================
        // BANREGIO THEME (Light - Corporate)
        // ============================================
        banregio: {
          // Primary - Naranja corporativo
          primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#FF8800', // Color principal
            600: '#ea7200',
            700: '#c45d00',
            800: '#9a4a00',
            900: '#7c3d00',
          },
          // Azul complementario
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          // Superficies - tonos crema/off-white
          surface: {
            50: '#FEFDFB',   // Blanco cálido principal
            100: '#FBF9F5',  // Crema muy claro
            200: '#F5F2EB',  // Crema claro
            300: '#EDE9E0',  // Crema medio
            400: '#D9D4C8',  // Crema oscuro
            500: '#C4BEB2',  // Gris cálido
            600: '#9E978A',  // Gris medio cálido
            700: '#7A7468',  // Texto secundario
            800: '#4A4640',  // Texto principal
            900: '#2D2A26',  // Texto oscuro
          },
        },
        // ============================================
        // HEY THEME (Dark - Modern)
        // ============================================
        hey: {
          // Primary - Cyan/Teal moderno
          primary: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
          },
          // Accent - Rosa/Magenta sutil
          accent: {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75',
          },
          // Superficies - tonos gris oscuro mate
          surface: {
            50: '#f8fafc',   // Blanco para contraste
            100: '#f1f5f9',  // Gris muy claro
            200: '#e2e8f0',  // Gris claro
            300: '#cbd5e1',  // Gris medio
            400: '#94a3b8',  // Texto secundario claro
            500: '#64748b',  // Texto medio
            600: '#475569',  // Gris medio oscuro
            700: '#334155',  // Fondo elevado
            800: '#1e293b',  // Fondo secundario
            900: '#0f172a',  // Fondo principal oscuro
            950: '#0a0f1a',  // Negro que no es negro
          },
        },
        // ============================================
        // COLORES SEMÁNTICOS (se cambian con el tema)
        // ============================================
        accent: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'typing': 'typing 1.5s infinite',
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
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}


