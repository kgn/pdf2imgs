const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
              to: path.join(__dirname, 'public/pdf.worker.min.js'),
            },
          ],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
