const path = require("path");
const webpack = require("webpack");
const { DuplicatesPlugin } = require("inspectpack/plugin");

module.exports = {
  entry: ["./build/web/esm/webIndex.js"],
  devtool: "source-map",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          path.resolve(__dirname, "file/"),
          path.resolve(__dirname, "esm/"),
        ],
      },
    ],
  },
  // optimization: {
  //     minimize: false,
  //     mangleExports: false,
  // },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      process: "process/browser",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      "$/deepHash": "arweave/web/lib/deepHash"
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      events: require.resolve("events/"),
      buffer: require.resolve("buffer/"),
      // "assert": require.resolve('assert/'),
      process: require.resolve("process/browser"),
      util: require.resolve("util"),
      // "zlib": require.resolve('browserify-zlib'),
      // "path": require.resolve('path-browserify')
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new DuplicatesPlugin({
      emitErrors: false,
      verbose: false,
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./build/web/"),
    libraryTarget: "umd",
    library: "Arbundles",
  },
};
