/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages serves from /repo-name/ by default, set it here:
  basePath: '/cs-map',        // ← replace with your actual repo name
  images: { unoptimized: true },
};
module.exports = nextConfig;