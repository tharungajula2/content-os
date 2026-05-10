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
        navy: '#1a1a2e',
        teal: '#16c79a',
        amber: '#f39c12',
        'category-wel': '#27ae60',
        'category-cog': '#2980b9',
        'category-rsn': '#8e44ad',
        'category-hum': '#e67e22',
        'category-sdb': '#95a5a6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
export default config;
