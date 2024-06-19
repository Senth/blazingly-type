const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@auth": path.resolve(__dirname, "src/auth/index"),
      "@components": path.resolve(__dirname, "src/components"),
      "@data": path.resolve(__dirname, "src/data"),
      "@db": path.resolve(__dirname, "src/db"),
      "@models": path.resolve(__dirname, "src/models"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@stores": path.resolve(__dirname, "src/stores"),
    },
  },
};
