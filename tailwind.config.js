/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ChatGPT system colors
        'chatgpt-bg': '#ffffff',
        'chatgpt-text': '#000000',
        'chatgpt-border': '#e5e5e5',
        'chatgpt-accent': '#10a37f',
      },
    },
  },
  plugins: [],
}
