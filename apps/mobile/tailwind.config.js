/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Custom colors matching the app design system
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8", // Used for active tab icons, etc.
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                },
                secondary: {
                    DEFAULT: "#10b981", // Emerald 500 (teal-ish)
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981",
                    600: "#059669",
                    700: "#047857",
                    800: "#065f46",
                    900: "#064e3b",
                },
                dark:
                {
                  DEFAULT: "#1f2937",
                  50: "#f9fafb",
                  100: "#f3f4f6",
                  200: "#e5e7eb",
                  300: "#d1d5db",
                  400: "#9ca3af",
                  500: "#6b7280",
                  600: "#4b5563",
                  700: "#374151",
                  800: "#1f2937",
                  900: "#111827",
                }
            },
            fontFamily: {
                sans: ["System"],
            },
        },
    },
  plugins: [],
}

