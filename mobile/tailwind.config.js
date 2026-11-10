module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#17233C',
        orange: '#EB7437',
        ink: '#273348',
        fog: '#F5F7FB',
        line: '#DEE5ED'
      }
    }
  },
  plugins: []
};
