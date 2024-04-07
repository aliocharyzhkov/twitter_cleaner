const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'scripts/block_noise.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/icons/*', to: 'icons/[name][ext]' },
        { from: 'src/manifest.json', to: './' },
        { from: 'src/options/*', to: 'options/[name][ext]' },
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
  mode: 'production',
};
