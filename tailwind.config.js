module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 8s infinite alternate',
        'pulse-slow': 'pulse 12s infinite alternate-reverse',
        /* Keeping these animation definitions in case they're needed elsewhere */
        'float': 'float 18s infinite ease-in-out',
        'float-reverse': 'float-reverse 22s infinite ease-in-out',
        'float-slow': 'float-slow 20s infinite ease-in-out',
        'float-reverse-slow': 'float-reverse-slow 19s infinite ease-in-out',
        'float-slower': 'float-slower 24s infinite ease-in-out',
        'rise': 'rise 8s infinite linear',
        'pulse-ring': 'pulse-ring 4s infinite ease-out',
        'pulse-ring-delay-1': 'pulse-ring 4s infinite ease-out 1.3s',
        'pulse-ring-delay-2': 'pulse-ring 4s infinite ease-out 2.6s',
        'title-glow': 'title-glow 3s infinite alternate',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
