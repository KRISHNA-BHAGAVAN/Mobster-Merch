import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Storm Gust', 'sans-serif'],
        'body': ['Ramisa', 'serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        dividerWeight: "2px", 
        disabledOpacity: 0.5, 
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem", 
          small: "1.25rem", 
          medium: "1.5rem", 
          large: "1.75rem", 
        },
        radius: {
          small: "2px", 
          medium: "4px", 
          large: "8px", 
        },
        borderWidth: {
          small: "1px", 
          medium: "2px", 
          large: "3px", 
        },
      },
      themes: {
        light: {
          colors: {
            background: "#0a0a0a",
            foreground: "#ffffff",
            focus: "#FF0000",
            divider: "rgba(255, 0, 0, 0.5)",
            content1: {
              DEFAULT: "#121212",
              foreground: "#ffffff"
            },
            content2: {
              DEFAULT: "#1a1a1a",
              foreground: "#ffffff"
            },
            content3: {
              DEFAULT: "#222222",
              foreground: "#ffffff"
            },
            content4: {
              DEFAULT: "#2a2a2a",
              foreground: "#ffffff"
            },
            default: {
              50: "#f5f5f5",
              100: "#e5e5e5",
              200: "#cccccc",
              300: "#b3b3b3",
              400: "#999999",
              500: "#808080",
              600: "#666666",
              700: "#4d4d4d",
              800: "#333333",
              900: "#1a1a1a",
              DEFAULT: "#808080",
              foreground: "#ffffff"
            },
            primary: {
              50: "#ffe6e6",
              100: "#ffcccc",
              200: "#ff9999",
              300: "#ff6666",
              400: "#ff3333",
              500: "#FF0000",
              600: "#cc0000",
              700: "#990000",
              800: "#660000",
              900: "#330000",
              DEFAULT: "#FF0000",
              foreground: "#ffffff"
            },
            secondary: {
              50: "#ffeef2",
              100: "#ffdce5",
              200: "#ffb9cb",
              300: "#ff96b1",
              400: "#ff7397",
              500: "#FF507D",
              600: "#cc4064",
              700: "#99304b",
              800: "#662032",
              900: "#331019",
              DEFAULT: "#FF507D",
              foreground: "#ffffff"
            },
            success: {
              50: "#e6f7e6",
              100: "#ccefcc",
              200: "#99df99",
              300: "#66cf66",
              400: "#33bf33",
              500: "#00af00",
              600: "#008c00",
              700: "#006900",
              800: "#004600",
              900: "#002300",
              DEFAULT: "#00af00",
              foreground: "#ffffff"
            },
            warning: {
              50: "#fff8e6",
              100: "#fff1cc",
              200: "#ffe399",
              300: "#ffd566",
              400: "#ffc733",
              500: "#ffb900",
              600: "#cc9400",
              700: "#996f00",
              800: "#664a00",
              900: "#332500",
              DEFAULT: "#ffb900",
              foreground: "#000000"
            },
            danger: {
              50: "#ffe6e6",
              100: "#ffcccc",
              200: "#ff9999",
              300: "#ff6666",
              400: "#ff3333",
              500: "#FF0000",
              600: "#cc0000",
              700: "#990000",
              800: "#660000",
              900: "#330000",
              DEFAULT: "#FF0000",
              foreground: "#ffffff"
            }
          }
        },
        dark: {
          colors: {
            background: "#0a0a0a",
            foreground: "#ffffff",
            focus: "#FF0000",
            divider: "rgba(255, 0, 0, 0.5)",
            content1: {
              DEFAULT: "#121212",
              foreground: "#ffffff"
            },
            content2: {
              DEFAULT: "#1a1a1a",
              foreground: "#ffffff"
            },
            content3: {
              DEFAULT: "#222222",
              foreground: "#ffffff"
            },
            content4: {
              DEFAULT: "#2a2a2a",
              foreground: "#ffffff"
            },
            default: {
              50: "#f5f5f5",
              100: "#e5e5e5",
              200: "#cccccc",
              300: "#b3b3b3",
              400: "#999999",
              500: "#808080",
              600: "#666666",
              700: "#4d4d4d",
              800: "#333333",
              900: "#1a1a1a",
              DEFAULT: "#808080",
              foreground: "#ffffff"
            },
            primary: {
              50: "#ffe6e6",
              100: "#ffcccc",
              200: "#ff9999",
              300: "#ff6666",
              400: "#ff3333",
              500: "#FF0000",
              600: "#cc0000",
              700: "#990000",
              800: "#660000",
              900: "#330000",
              DEFAULT: "#FF0000",
              foreground: "#ffffff"
            },
            secondary: {
              50: "#ffeef2",
              100: "#ffdce5",
              200: "#ffb9cb",
              300: "#ff96b1",
              400: "#ff7397",
              500: "#FF507D",
              600: "#cc4064",
              700: "#99304b",
              800: "#662032",
              900: "#331019",
              DEFAULT: "#FF507D",
              foreground: "#ffffff"
            }
          }
        }
      }
    })
  ]
}
