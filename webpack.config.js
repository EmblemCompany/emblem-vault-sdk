const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'docs'),
    library: 'EmblemVaultSdk',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.NormalModuleReplacementPlugin(
      /src\/clients\/emblemVaultSolanaWalletClient\.ts$/,
      path.resolve(__dirname, 'src/clients/emptyClient.ts')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /src\/clients\/emblemVaultWalletClient\.ts$/,
      path.resolve(__dirname, 'src/clients/emptyClient.ts')
    )
  ]
};
