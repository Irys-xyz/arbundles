const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./shim.ts",
  devtool: "source-map",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    // alias: {
    //     process: "process/browser",
    //     crypto: "crypto-browserify",
    //     stream: "stream-browserify",
    // },
    // fallback: {
    //     "crypto": require.resolve("crypto-browserify"),
    //     "assert": require.resolve("assert/"),
    //     "stream": require.resolve("stream-browserify"),
    //     "process": require.resolve("process/browser"),
    //     "util": require.resolve("util"),
    //     "events": require.resolve("events/"),
    //     "buffer": require.resolve('buffer/'),
    //     "zlib": require.resolve("browserify-zlib"),
    //     "path": require.resolve("path-browserify")
    // }
    fallback: {
      crypto: false,
      stream: false,
      buffer: false,
      path: false,
      zlib: false,
    },
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //     process: 'process/browser',
    //     Buffer: ['buffer', 'Buffer']
    // }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "."),
    //libraryTarget: "umd", //'module',
    // umdNamedDefine: true
    library: {
      type: "umd",
      name: "Arbundles",
    },
  }, //,
  // experiments: {
  //     outputModule: true,
  // }
};
