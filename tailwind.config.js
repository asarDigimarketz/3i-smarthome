/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        services: {
          // Home Cinema colors
          cinema: {
            primary: '#613eff',
            secondary: '#9cbbff',
            light: '#f1f4ff',
            border: '#5500ff'
          },
          // Home Automation colors
          automation: {
            primary: '#014c95',
            secondary: '#36b9f6',
            light: '#e2f3ff',
            border: '#0068ad'
          },
          // Security System colors
          security: {
            primary: '#026b87',
            secondary: '#5deaff',
            light: '#ebf8fc',
            border: '#00a8d6'
          },
          // Outdoor Audio colors
          audio: {
            primary: '#df2795',
            secondary: '#eb7ab7',
            light: '#ffe9f6',
            border: '#db0a89'
          },
          // Default/All colors
          default: {
            primary: '#4F46E5',
            secondary: '#06B6D4',
            light: '#fae9ea',
            border: '#c92125'
          }
        }
      }
    },
  },
  plugins: [],
}
