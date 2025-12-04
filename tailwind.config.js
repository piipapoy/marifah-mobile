/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan path ini benar menunjuk ke file-file kamu
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // <--- INI WAJIB DI V4
  theme: {
    extend: {
      colors: {
        primary: "#0F172A", 
        card: "#1E293B",    
        accent: "#10B981",  
        gold: "#F59E0B",    
      }
    },
  },
  plugins: [],
}