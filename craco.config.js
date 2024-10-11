const webpack = require("webpack");
const path = require("path");
const { whenDev } = require("@craco/craco");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add WASM support
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        asyncWebAssembly: true,
      };

      webpackConfig.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      // Use file-loader for worker files and disable source map loading
      webpackConfig.module.rules.push({
        test: /\.worker\.js$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "[name].[contenthash].js" },
          },
          {
            loader: "source-map-loader",
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                // Disable source map loading for duckdb worker
                if (resourcePath.includes("@duckdb/duckdb-wasm")) {
                  return false;
                }
                return true;
              },
            },
          },
        ],
      });

      // Copy DuckDB worker files to build directory
      webpackConfig.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^duckdb-browser-eh\.worker\.js$/,
          path.resolve(
            __dirname,
            "node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js"
          )
        )
      );

      // Find the rule that uses source-map-loader
      const sourceMapRule = webpackConfig.module.rules.find(
        (rule) =>
          rule.use &&
          rule.use.some((loader) => loader.loader === "source-map-loader")
      );

      if (sourceMapRule) {
        // Add an exclude condition for @duckdb packages
        sourceMapRule.exclude = [/node_modules\/(?!@duckdb)/];
      }

      // Ignore source map warnings for problematic packages
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
      ];

      return webpackConfig;
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
};
