// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const path = require("path");

const config = {
  mode: "production",
  devtool: "source-map",
  entry: "./uber-noise.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

const esmConfig = {
  ...config,
  output: {
    globalObject: "this",
    filename: "uber-noise.module.js",

    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, "dist"),
  },
  target: ["web"],
  experiments: {
    outputModule: true,
  },
};

const umdConfig = {
  ...config,
  output: {
    globalObject: "this",
    filename: "uber-noise.js",

    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "UberNoise",
      type: "umd",
      export: "default",
    },
  },
  name: "browser",

  devServer: {
    static: ["./examples", "./dist"],
    port: 8765,
    liveReload: true,
    watchFiles: ["./uber-noise.ts"],

    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  },
};

// eslint-disable-next-line no-undef
module.exports = [esmConfig, umdConfig];
