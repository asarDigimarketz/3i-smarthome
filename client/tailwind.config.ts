import type { Config } from "tailwindcss";

import { heroui } from "@heroui/theme";

/** @type {Config} */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hotel Primary Colors
        "hotel-primary": `var(--hotel-primary)`,
        "hotel-primary-text": "#0D0E0D",
        "hotel-primary-darkgreen": "#18B754",
        "hotel-primary-green": "#25D366",
        "hotel-primary-red": "#FF0000",
        "hotel-primary-darkred": "#9E3737",
        "hotel-primary-yellow": "#FFDF00",
        "hotel-primary-bg": "#F8F8F8",

        // Hotel Secondary Colors
        "hotel-secondary": "#E3F2FD",
        "hotel-secondary-accent": "#FFFFFF",
        "hotel-secondary-light-grey": "#D9D9D9",
        "hotel-secondary-grey": "#6E6E6E",
      },

      boxShadow: {
        input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              "50": "#fef2f2",
              "100": "#fee2e2",
              "200": "#fecaca",
              "300": "#fca5a5",
              "400": "#f87171",
              "500": "#ef4444",
              "600": "#dc2626",
              "700": "#b91c1c",
              "800": "#991b1b",
              "900": "#7f1d1d",
              DEFAULT: "#C92125",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
export default config;
