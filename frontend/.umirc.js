// https://umijs.org/config/
import { resolve } from 'path'
import { i18n } from './src/utils/config'

export default {
  publicPath: '/',
  hash: true,
  ignoreMomentLocale: true,
  targets: { ie: 9 },
  treeShaking: true,
  plugins: [
    [
      // https://umijs.org/plugin/umi-plugin-react.html
      'umi-plugin-react',
      {
        dva: { immer: true },
        antd: true,
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/Loader/Loader',
        },
        routes: {
          exclude: [
            /model\.(j|t)sx?$/,
            /service\.(j|t)sx?$/,
            /models\//,
            /components\//,
            /icons\//,
            /services\//,
          ],
          update: routes => {
            if (!i18n) return routes;

            const newRoutes = [];
            for (const item of routes[0].routes) {
              newRoutes.push(item);
              if (item.path) {
                newRoutes.push(
                  Object.assign({}, item, {
                    path:
                      `/:lang(${i18n.languages
                        .map(item => item.key)
                        .join('|')})` + item.path,
                  })
                )
              }
            }
            routes[0].routes = newRoutes;

            return routes
          },
        },
        dll: {
          include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch', 'antd/es'],
        },
        pwa: {
          manifestOptions: {
            srcPath: 'manifest.json',
          },
        },
      },
    ],
  ],
  // Theme for antd
  // https://ant.design/docs/react/customize-theme
  theme: './config/theme.config.js',
  // Webpack Configuration
  proxy: {
    '/api/v1/weather': {
      target: 'https://api.seniverse.com/',
      changeOrigin: true,
      pathRewrite: { '^/api/v1/weather': '/v3/weather' },
    },
  },
  alias: {
    api: resolve(__dirname, './src/services/'),
    components: resolve(__dirname, './src/components'),
    shared: resolve(__dirname, './src/shared'),
    icons: resolve(__dirname, './src/icons'),
    config: resolve(__dirname, './src/utils/config'),
    models: resolve(__dirname, './src/models'),
    routes: resolve(__dirname, './src/routes'),
    services: resolve(__dirname, './src/services'),
    themes: resolve(__dirname, './src/themes'),
    utils: resolve(__dirname, './src/utils'),
    img: resolve(__dirname, './public/img'),
  },
  extraBabelPresets: ['@lingui/babel-preset-react'],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash',
    ],
  ],
  chainWebpack: function(config, { webpack }) {
    config.merge({
      optimization: {
        minimize: process.env.NODE_ENV !== 'development',
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            react: {
              name: 'react',
              priority: 20,
              test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router)[\\/]/,
            },
            antd: {
              name: 'antd',
              priority: 20,
              test: /[\\/]node_modules[\\/](antd|@ant-design\/icons|@ant-design\/compatible|ant-design-pro)[\\/]/,
            },
            recharts: {
              name: 'recharts',
              priority: 20,
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            },
            async: {
              chunks: 'async',
              minChunks: 2,
              name: 'async',
              maxInitialRequests: 1,
              minSize: 0,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      },
    })
  },
}
