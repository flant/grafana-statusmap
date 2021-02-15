// Copy screenshots defined in plugin.json.

const path = require('path');
const pluginJson = require(path.resolve(process.cwd(), 'src/plugin.json'));
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports.getWebpackConfig = (config, options) => ({
  ...config,
  plugins: [...config.plugins, new CopyWebpackPlugin(
    pluginJson.info.screenshots.map(function(item) {
      return {from: "../docs/"+item.path, to: "./img"}
    }),
    { logLevel: options.watch ? 'silent' : 'warn' }
  ) ],
});
