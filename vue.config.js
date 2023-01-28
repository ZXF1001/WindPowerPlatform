const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: "./",

  // //调试工具
  // configureWebpack: {
  //   devtool: "source-map",
  // },
});
