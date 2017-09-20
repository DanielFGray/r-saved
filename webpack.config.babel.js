/* eslint-disable import/no-extraneous-dependencies */

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { redirect_uri } = require('./secrets')

const rules = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [
      'babel-loader',
      'eslint-loader',
    ],
  },
  {
    test: /\.[sc]ss$/,
    exclude: /node_modules/,
    use: ExtractTextPlugin.extract({
      use: [
        'css-loader?modules',
        'postcss-loader',
      ],
    }),
  },
  {
    test: /css$/,
    use: ExtractTextPlugin.extract({
      use: [
        'css-loader',
      ],
    }),
  },
]

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module =>
      module.context && module.context.indexOf('node_modules') !== -1,
  }),
  new ExtractTextPlugin({
    filename: '[name].bundle.css',
    allChunks: true,
  }),
  new HtmlWebpackPlugin({
    template: 'src/index.ejs',
    inject: false,
    title: 'r-saved: search your saved Reddit content',
    appMountId: 'main',
    mobile: true,
    devServer: '',
  }),
  new HtmlWebpackPlugin({
    filename: 'callback.html',
    template: 'src/static/callback.ejs',
    redirect_uri: redirect_uri.slice(0, redirect_uri.lastIndexOf('/') + 1),
    inject: false,
  }),
]

const entry = ['./src/index']

const stats = {
  chunks: false,
  modules: false,
  children: false,
}

module.exports = {
  entry,
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules,
  },
  plugins,
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    publicPath: '/',
    stats,
  },
  stats,
}
