const webpack = require("webpack");
const { EsbuildPlugin } = require('esbuild-loader')

module.exports = {
  webpack: function override(config, webpackEnv) {

    let loaders = config.resolve
    loaders.fallback = {
      "fs": false,
      // "tls": false,
      // "net": false,
      "http": require.resolve("stream-http"),
      "https": false,
      "zlib": require.resolve("browserify-zlib"),
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      os: require.resolve("os-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      // net: false,
      // tls: false,
      // tty: false,
      // "querystring": false,
      // "readline": false,
      // child_process: false,
      // constants: false,
    }

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        // why need to add .js? 
        process: "process/browser.js",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // "./node_modules/@graphql-tools/url-loader/cjs$": path.resolve(__dirname, "index.js")
      },
    }

    config.module = {
      ...config.module,
      rules: [
        // filter out the  babel-loader
        ...config.module.rules.filter(rule => {
          return !rule.loader || !rule.loader.includes('babel-loader')
        }),
        {
          // Match js, jsx, ts & tsx files
          test: /\.(cjs|js|mjs|jsx|ts|tsx)$/,
          loader: 'esbuild-loader',
          options: {
            tsconfig: './tsconfig.json',
            // JavaScript version to compile to
            target: 'es2020'
          }
        },
      ]
    }


    config.optimization = {
      ...config.optimization,
      minimizer: [
        new EsbuildPlugin({
          target: 'es2020',  // Syntax to compile,
          css: true

        }),
      ]
    }

    return config
  }
}