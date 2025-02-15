/*eslint-env node*/

const path = require('path');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        entry: './src/entry.js',
    },
    output: {
        path: path.resolve('./dist'),
        publicPath: '/dist/',
        filename: '[name].js',
    },
    resolve: {
        fallback: {
            fs: false,
            path: false,
            crypto: false,
            buffer: false,
            perf_hooks: false,
            buffer: require.resolve('buffer/'),
        },
        extensions: ['.ts', '.tsx', '.js', '.json'],
        mainFields: ['jsnext:main', 'browser', 'main'],
    },
    module: {
        rules: [
            {
                test: /\.worker\.ts$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        inline: 'no-fallback',
                    },
                },
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'webpack-strip-block',
                        options: {
                            start: 'IGNORE_WEBPACK:START',
                            end: 'IGNORE_WEBPACK:END',
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            configFile: path.resolve(__dirname, '..', '.babelrc'),
                        },
                    },
                ],
            },
            {
                test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|cur)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000, // 10kb
                    },
                },
                generator: {
                    filename: '[hash][ext]',
                },
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: { transpileOnly: true },
            },
            {
                test: /\.(css|less)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            sourceMap: false,
                        },
                    },
                    {
                        loader: require.resolve('postcss-loader'),
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                require('postcss-flexbugs-fixes'),
                                require('cssnano')({ preset: 'default' }),
                                autoprefixer({
                                    overrideBrowserslist: [
                                        '>1%',
                                        'last 4 versions',
                                        'Firefox ESR',
                                        'not ie < 9', // React doesn't support IE8 anyway
                                    ],
                                    flexbox: 'no-2009',
                                    remove: false,
                                }),
                            ],
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: false,
                        },
                    },
                ],
            },
        ],
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@entrylabs/tool': 'EntryTool',
        'entry-paint': 'EntryPaint',
        '@entrylabs/sound-editor': 'EntrySoundEditor',
        '@entrylabs/legacy-video': 'EntryVideoLegacy',
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.join(__dirname, '..'),
        }),
        new WebpackManifestPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(
                        __dirname,
                        '..',
                        'node_modules',
                        'khaiii',
                        'dist',
                        'libkhaiii.wasm'
                    ),
                    to: path.join(__dirname, '..', 'dist', 'libkhaiii.wasm'),
                    toType: 'file',
                },
            ],
        }),
    ],
};
