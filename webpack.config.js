const wp = require('webpack');
const path = require('path');
const dotenv = require('dotenv');
// plugins
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin"); // use external module to handle new version
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function envPath(env) {
    if (env) {
        if (env.production) return '.production';
        if (env.development) return '.development';
        if (env.qa) return '.qa';
        if (env.staging) return '.staging';
    }
    return '';
}

/**
 * Css/sass-loader will convert url() to current path (https://webpack.js.org/loaders/css-loader/)
 * All /assets/ link will be not get from root, so we need to by pass this case
 * @param url
 * @param resourcePath
 * @return {boolean}
 */
function cssUrlResolve(url, resourcePath) {
    if (url.includes('/assets/')) return false
    return true
}

const WEBPACK_MODE = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production'
}

function allowSourceMap(mode, env) {
    // enable source map for develop build or develop mode
    if (mode == WEBPACK_MODE.DEVELOPMENT || env.development) {
        // return 'eval'   // => include js only but fast
        return 'eval-source-map' // => include jsx but slow
    }
    return undefined;
}


module.exports = (env, argv) => {

    console.log('[webpack-config]', argv)
    const mode = argv.mode

    // call dotenv and it will return an Object with a parsed key
    let dotEnvObject = dotenv.config({ path: './.env' + envPath(env) }).parsed;

    // reduce it to a nice object, the same as before
    const envKeys = Object.keys(dotEnvObject).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(dotEnvObject[next]);
        return prev;
    }, {});


    return {
        devtool: allowSourceMap(mode, env),
        output: {
            publicPath: '/',
            clean: true,
            filename: '[name].bundle.js',
            chunkFilename: "[name].[id].[fullhash].chunk.js"
        },
        resolve: {
            alias: {
                '@test': path.resolve(__dirname, 'test/'),
                '@public': path.resolve(__dirname, 'public/'),
                '@sass': path.resolve(__dirname, 'sass/'),
                '@components': path.resolve(__dirname, 'src/components/'),
                '@layout': path.resolve(__dirname, 'src/components/layout/'),
                '@shared': path.resolve(__dirname, 'src/components/shared/'),
                '@config': path.resolve(__dirname, 'src/config/'),
                '@models': path.resolve(__dirname, 'src/models/'),
                '@pages': path.resolve(__dirname, 'src/pages/'),
                '@services': path.resolve(__dirname, 'src/services/'),
                '@utils': path.resolve(__dirname, 'src/utils/'),
            },
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "stream": require.resolve("stream-browserify"),
                "crypto": false,
                "crypto-browserify": require.resolve('crypto-browserify'),
                "buffer": require.resolve("buffer")
            },
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            },
            minimizer: [
                new JsonMinimizerPlugin(),
                new HtmlMinimizerPlugin(),
                new CssMinimizerPlugin(),
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true // clear all console.log
                        }
                    }
                })
            ],
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    resolve: {
                        extensions: ['.js','.jsx','.json']
                    }
                },
                {
                    test: /\.(css|sass)$/,
                    exclude: /\.module\.(css|sass)$/,
                    use: [mode === WEBPACK_MODE.DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: cssUrlResolve,
                                sourceMap: dotEnvObject['GENERATE_CSS_SOURCE_MAP'] === 'true'
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                url: cssUrlResolve,
                                sourceMap: dotEnvObject['GENERATE_CSS_SOURCE_MAP'] === 'true'
                            }
                        },],
                },
                {
                    test: /\.svg/,
                    use: [
                        {
                            loader: 'svg-url-loader',
                            options: {
                                // make loader to behave like url-loader, for all svg files
                                encoding: "base64",
                            },
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|ico)$/,
                    type: 'asset'
                },
                {
                    test: /\.(woff(2)?|ttf|eot)$/,
                    type: 'asset/inline'
                },
                {
                    test: /\.module\.(scss|sass)$/,
                    use: [
                        {
                            loader: mode === WEBPACK_MODE.DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: cssUrlResolve,
                                modules: true,
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                url: cssUrlResolve,
                                modules: true
                            }
                        }
                    ]
                },
                {
                    test: require.resolve('jquery'),
                    use: [{
                        loader: 'expose-loader',
                        options: {
                            exposes: {
                                globalName: 'jQuery',
                                override: true
                            },
                        }
                    },{
                        loader: 'expose-loader',
                        options: {
                            exposes: {
                                globalName: '$',
                                override: true
                            },
                        }
                    }]
                },
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin(
                {
                    filename: '[name].[fullhash].css',
                    chunkFilename: '[name].[fullhash].css',
                }
            ),
            new HtmlPlugin(
                {
                    template: path.join(__dirname, '/public/index.html'),
                    favicon: path.join(__dirname, '/public/favicon.ico'),
                    env: dotEnvObject
                }
            ),
            new CopyPlugin(
                {
                    patterns: [
                        {
                            from: path.join(__dirname, '/public/manifest.json'),
                            to: ''
                        },
                        {
                            from: path.join(__dirname, '/public/assets'),
                            to: 'assets'
                        },
                        {
                            from: path.join(__dirname, '/public/locales'),
                            to: 'locales'
                        }
                    ]
                }
            ),
            new ImageMinimizerPlugin({
                minimizerOptions: {
                    severityError: 'warning', // Ignore errors on corrupted images
                    plugins: [
                        ['jpegtran', { progressive: true }],
                        ['optipng', { optimizationLevel: 5 }],
                    ],
                    loader: false
                },
                filter: (source, sourcePath) => {
                    return mode === WEBPACK_MODE.PRODUCTION && env.production
                }, // only enable for production build stage
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: mode === WEBPACK_MODE.PRODUCTION? 'static':'disabled', // only enable for build stage
                reportFilename: 'report-bundle.html'
            }),
            new wp.DefinePlugin(envKeys),
            new wp.ProvidePlugin({
                process: 'process/browser',
                $: 'jquery',
                _: 'lodash',
                jQuery: 'jquery',
                moment: 'moment',
                Buffer: ['buffer', 'Buffer']
            }),
        ],
        devServer: {
            historyApiFallback: {
                index: '/'
            },
            hot: true,
            liveReload: true,
            open: true
        }
    }
};
