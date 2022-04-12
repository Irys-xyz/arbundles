const { DuplicatesPlugin } = require("inspectpack/plugin");
const path = require("path");
const webpack = require("webpack");

const base = {
  entry: "./shim.ts",
  devtool: "source-map",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          // path.resolve(__dirname, "./esm/umd.bundle.js")
        ],
      },
    ],
  },
  externals: {
    // Buffer: "Buffer",
    // crypto: "injCrypto",
    // "process": "process",
    // "stream": "stream",
    // "path": "path",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      // process: "process/browser",
      // crypto: "crypto-browserify",
      // stream: "stream-browserify",
    },
    fallback: {
      path: require.resolve("path-browserify"),
      zlib: require.resolve("browserify-zlib"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      // "assert": require.resolve("assert/"),
      // "process": require.resolve("process/browser"),
      // "util": require.resolve("util"),
      // "events": require.resolve("events/"),
      // "zlib": require.resolve("browserify-zlib"),
      // "path": require.resolve("path-browserify")
      // "crypto": false,
      // "assert": require.resolve("assert/"),
      // "stream": require.resolve("stream-browserify"),
      // "process": require.resolve("process/browser"),
      // "util": require.resolve("util"),
      // "events": require.resolve("events/"),
      // "buffer": require.resolve('buffer/'),
    },
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //     process: 'process/browser',
    //     Buffer: ['buffer', 'Buffer']
    // }),
    new DuplicatesPlugin({
      emitErrors: false,
      verbose: false,
    }),
  ],
};

const esm = {
  ...base,
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./esm"),
    libraryTarget: "module",
    umdNamedDefine: true,
  },
  experiments: {
    outputModule: true,
  },
};
const umd = {
  ...base,
  output: {
    filename: `umd.bundle.js`,
    path: path.resolve(__dirname, "./esm"),
    library: "arbundles",
    libraryTarget: "umd",
    globalObject: "globalThis",
    umdNamedDefine: true,
  },
};
module.exports = [esm, umd];
