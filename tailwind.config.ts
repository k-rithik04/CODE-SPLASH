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
        bg: '#000000',
        white: '#ffffff',
        orange: '#ff6b00',
        'orange-glow': 'rgba(255, 107, 0, 0.4)',
        'glass-bg': 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        main: ['var(--font-poppins)', 'sans-serif'],
      }
    }
  },
  plugins: [],
};
export default config;