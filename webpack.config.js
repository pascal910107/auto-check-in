const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipWebpackPlugin = require("zip-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");

const path = require("path");

module.exports = {
  entry: {
    background: "./src/background.js",
    main: "./src/main.js",
    function: "./src/function.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {
            js: 'babel-loader'
          }
        }
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./public", to: "./" },
        { from: "./images", to: "./images" },
      ],
    }),
    new ZipWebpackPlugin({
      path: "zip",
      filename: "dist.zip",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};
