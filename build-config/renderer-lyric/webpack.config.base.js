const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HTMLPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanCSSPlugin = require('less-plugin-clean-css')

const vueLoaderConfig = require('../vue-loader.config')
const { mergeCSSLoader } = require('../utils')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  target: 'electron-renderer',
  entry: {
    'renderer-lyric': path.join(__dirname, '../../src/renderer-lyric/main.js'),
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../../dist/electron'),
    publicPath: 'auto',
  },
  resolve: {
    alias: {
      '@main': path.join(__dirname, '../../src/main'),
      '@renderer': path.join(__dirname, '../../src/renderer'),
      '@lyric': path.join(__dirname, '../../src/renderer-lyric'),
      '@static': path.join(__dirname, '../../src/static'),
      '@common': path.join(__dirname, '../../src/common'),
    },
    extensions: ['*', '.js', '.json', '.vue', '.node'],
  },
  module: {
    rules: [
      {
        test: /\.(vue|js)$/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-formatter-friendly'),
            emitWarning: isDev,
          },
        },
        exclude: /node_modules/,
        enforce: 'pre',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        oneOf: mergeCSSLoader(),
      },
      {
        test: /\.less$/,
        oneOf: mergeCSSLoader({
          loader: 'less-loader',
          options: {
            sourceMap: true,
            lessOptions: {
              plugins: [
                new CleanCSSPlugin({ advanced: true }),
              ],
            },
          },
        }),
      },
      {
        test: /\.styl(:?us)?$/,
        oneOf: mergeCSSLoader({
          loader: 'stylus-loader',
          options: {
            sourceMap: true,
          },
        }),
      },
      {
        test: /\.pug$/,
        oneOf: [
          // Use pug-plain-loader handle .vue file
          {
            resourceQuery: /vue/,
            use: ['pug-plain-loader'],
          },
          // Use pug-loader handle .pug file
          {
            use: ['pug-loader'],
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'imgs/[name]-[contenthash:8][ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'media/[name]-[contenthash:8][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'fonts/[name]-[contenthash:8][ext]',
        },
      },
    ],
  },
  performance: {
    maxEntrypointSize: 300000,
  },
  plugins: [
    new HTMLPlugin({
      filename: 'lyric.html',
      template: path.join(__dirname, '../../src/renderer-lyric/index.pug'),
      isProd: process.env.NODE_ENV == 'production',
      browser: process.browser,
      scriptLoading: 'blocking',
      __dirname,
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: isDev ? '[name].css' : '[name].[contenthash:8].css',
      chunkFilename: isDev ? '[id].css' : '[id].[contenthash:8].css',
    }),
  ],
}
