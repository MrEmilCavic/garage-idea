/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/{component-library-name}/src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#F1A500', 
        'secondary': '#1F2937', 
        'accent': '#4B5563', 
        'background': '#0F172A', 
        'text-primary': '#F3F4F6', 
        'text-secondary': '#E5E7EB',
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
      },
      spacing: {
        '128': '32rem', 
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem', 
      },
      boxShadow: {
        'inner': 'inset 0 0 15px rgba(0, 0, 0, 0.1)', 
      },
    },
  },
  plugins: [require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),],
}

