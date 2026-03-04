/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Catch root files like App.tsx if they are not in src (Wait, structure is flat?)
    ],
    theme: {
        extend: {
            colors: {
                'zarhrah-gold': '#C5A059',
                'zarhrah-stone': '#f5f5f4',
                'zarhrah-obsidian': '#0c0a09',
                'zarhrah-cream': '#fdfdfd',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [],
}
