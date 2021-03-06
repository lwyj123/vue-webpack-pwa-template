var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// var CompressionPlugin = require('compression-webpack-plugin')

// PWA part
const WorkBoxPlugin = require('workbox-webpack-plugin')
const SwRegisterWebpackPlugin = require('sw-register-webpack-plugin')
const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin')

var env = process.env.NODE_ENV === 'production' ? config.build.prodEnv : config.build.sitEnv

function resolveApp (relativePath) {
  return path.resolve(relativePath)
}

var webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: {
            drop_debugger: true,
            drop_console: true,
            warnings: false
          }
        },
        sourceMap: false
      })
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
          priority: 1,
          enforce: true,
          test (module, chunks) {
            const name = module.nameForCondition && module.nameForCondition()
            return chunks.some(chunk => {
              return chunk.name === 'app' && /[\\/]node_modules[\\/]/.test(name)
            })
          }
        }
      }
    }
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      favicon: resolveApp('favicon.ico'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      path: config.build.staticPath,
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   chunks: ['vendor']
    // }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../src/manifest.json'),
        to: config.build.assetsRoot
      },
      {
        from: path.resolve(__dirname, '../src/assets/wuanlife_256.jpg'),
        to: config.build.assetsRoot
      }
    ]),
    new WorkBoxPlugin.InjectManifest({
      swSrc: path.resolve(__dirname, '../src/service-worker.js')
    }),
    // 通过插件生成sw生成
    new SwRegisterWebpackPlugin({
      version: +new Date()
    }),
    new SkeletonWebpackPlugin({
      webpackConfig: require('./webpack.skeleton.conf'),
      router: {
        mode: 'hash',
        routes: [
          {
            path: '/',
            skeletonId: 'skeleton'
          },
          {
            path: '/detail',
            skeletonId: 'skeleton_detail'
          }
        ]
      }
    })
  ]
})
/* 开启 gzip 的情况下使用下方的配置 */
if (config.build.productionGzip) {
  /* 加载 compression-webpack-plugin 插件 */
  var CompressionWebpackPlugin = require('compression-webpack-plugin')
  /* 向webpackconfig.plugins中加入下方的插件 */
  webpackConfig.plugins.push(
    /* 使用 compression-webpack-plugin 插件进行压缩 */
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
            config.build.productionGzipExtensions.join('|') +
            ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}
if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}
module.exports = webpackConfig
