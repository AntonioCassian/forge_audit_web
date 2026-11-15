/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // MUI já traz o CssBaseline; desligar o preflight evita reset duplicado e conflitos.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        slate900: '#17263A',
        steel: '#1F3A5F',
        mist: '#EEF1F4',
      },
    },
  },
  plugins: [],
};
