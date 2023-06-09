// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const path = require("path");

// eslint-disable-next-line no-undef
module.exports = {
  mode: "production",
  entry: "./dist/esm/uber-noise.js",
  output: {
    filename: "uber-noise.js",
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, "dist"),

    library: {
      name: "UberNoise",
      type: "umd",
      export: "default",
    },
  },
};
