/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0F172A',
                    card: '#1E293B',
                    border: '#334155',
                    text: '#F8FAFC',
                    muted: '#94A3B8'
                },
                brand: {
                    300: '#5EEAD4',
                    400: '#2DD4BF',
                    500: '#14B8A6',
                    600: '#0D9488',
                    700: '#0F766E',
                    800: '#115E59'
                }
            }
        },
    },
    plugins: [],
}
