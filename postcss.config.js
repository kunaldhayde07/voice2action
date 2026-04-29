/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Add other PostCSS plugins here if needed (e.g., cssnano for production)
  },
};

module.exports = config;