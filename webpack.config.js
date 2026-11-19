const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    modeler: './src/modeler-entry.js',
    simulation: './src/simulation-entry.js'
  },

  output: {
    path: path.resolve(__dirname, 'docs', 'dist'),
    filename: '[name].bundle.js',
    publicPath: 'auto',
    clean: true
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'docs')
    },
    compress: true,
    port: 8090
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.bpmn$/i,
        type: 'asset/source'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './docs/index.html'
    })
  ]
};