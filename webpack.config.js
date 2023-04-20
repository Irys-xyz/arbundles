const path = require("path");
const webpack = require("webpack");
const { DuplicatesPlugin } = require("inspectpack/plugin");

module.exports = {
  entry: ["./build/web/esm/webIndex.js"],
  devtool: "source-map",
  mode: "production",
  // module: {
  //   rules: [
  //     {
  //       test: /\.ts$/,
  //       use: { loader: "ts-loader", options: { configFile: "web.tsconfig.json" } },
  //       exclude: [
  //         /node_modules/,
  //         path.resolve(__dirname, "build/"),
  //       ],
  //     },
  //   ],
  // },
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
      "$/utils": path.resolve(
        __dirname,
        "./src/webUtils.ts"
      ),
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      events: require.resolve("events/"),
      buffer: require.resolve("buffer/"),
      process: require.resolve("process/browser"),
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
