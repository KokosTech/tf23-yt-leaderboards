import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        origintech: ["var(--font-origintech)", ...fontFamily.sans],
      },
      colors: {
        black: "rgb(20, 20, 32)",
      },
    },
  },
  plugins: [],
} satisfies Config;
