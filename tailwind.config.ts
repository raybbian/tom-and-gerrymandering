import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        textBlack: "#1a202c",
        primary: "#FEFEFE",
        secondary: "#E6CED4",
        red: "#C64B47",
        textWhite: "#FAE5F3",
        cheese: "#FFD700",
        lblue: "#7796AD",
        dblue: "#40547B",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        shermlock: ['var(--font-shermlock)', "serif"],
        marker: ["Permanent Marker", "cursive"],
        serif: ["Merriweather", "serif"],
        mono: ["Fira Code", "monospace"],
      },
      fontSize: {
        base: "1vw",
        lg: "2vw",
      }
    },
  },
  plugins: [],
};
export default config;
