module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  tabWidth: 2,
  semi: true,
  plugins: ['prettier-plugin-tailwindcss'],
  endOfLine: 'auto',
};

// npx prettier "**/*.{js,ts,jsx,tsx,json,md,yml,yaml}" --write
