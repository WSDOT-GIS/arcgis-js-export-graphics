const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/script.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "./dist/")
  },
  externals: /^esri(\.\w+)+$/
};
