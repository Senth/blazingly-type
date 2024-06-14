const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@auth": path.resolve(__dirname, "src/auth/index"),
      "@models": path.resolve(__dirname, "src/models"),
      "@data": path.resolve(__dirname, "src/data"),
      "@stores": path.resolve(__dirname, "src/stores"),
    },
  },
};