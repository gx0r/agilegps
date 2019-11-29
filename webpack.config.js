// webpack.config.js

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = {}) => {

  console.log('NODE_ENV: ', env.NODE_ENV);
  console.log('Production: ', env.production);
  const CONFIG = require('./config/web.js');

  return {
    entry: './src/client/main.js',
    output: {
      path: path.join(__dirname, '/public'),
      filename: '[name].bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index-template.html',
        title: 'AgileGPS Pro',
        googleAnalyticsKey: CONFIG.googleAnalyticsKey,
        googleAPIkey: CONFIG.googleAPIkey,
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    mode: env.production ? 'production' : 'development',
    devtool: 'eval-source-map',
    module: {
      // preLoaders: [
      //     {test: /\.js$/, exclude: /node_modules/, loader: 'jshint-loader'}
      // ],
      rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          // loader: 'swc-loader',
          // options: {
          //   presets: ['@babel/preset-env']
          // }
        },
        {
          test: /bootstrap\/js\//,
          use: {
            loader: "imports-loader",
            options: {
              jQuery: "jquery"
            }
          }
        },
        {
          test: /\.less$/,
          use: [{
              loader: "style-loader"
            },
            {
              loader: "css-loader"
            },
            {
              loader: "less-loader"
            }
          ]
        },
        {
          test: /\.css$/,
          use: [{
              loader: "style-loader"
            },
            {
              loader: "css-loader"
            }
          ]
        },
        {
          test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "application/font-woff"
            }
          }
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "application/octet-stream"
            }
          }
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: "file-loader"
          }
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "image/svg+xml"
            }
          }
        }
      ]
    },
  };
}
