import { Z_INDEX } from './src/config/defaults.js'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      zIndex: {
        dropdown: Z_INDEX.dropdown,
        modal: Z_INDEX.modal,
        toast: Z_INDEX.toast,
        offline: Z_INDEX.offlineBanner,
        'info-toast': Z_INDEX.infoToast,
      },
    },
  },
  plugins: [],
}
