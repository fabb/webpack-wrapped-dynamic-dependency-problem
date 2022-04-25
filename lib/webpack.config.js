const { realpathSync } = require('fs')
const { resolve, join } = require('path')
const appDirectory = realpathSync(process.cwd())
const resolvePath = (relativePath) => resolve(appDirectory, relativePath)

module.exports = () => ({
    context: realpathSync(process.cwd()),
    module: {
        rules: [
            {
                include: resolvePath('src'),
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                        },
                    },
                ],
            },
        ],
    },
    output: {
        chunkLoadingGlobal: 'webpackLibChunk',
        filename: '[name].js',
        globalObject: 'this',
        library: {
            name: 'Lib',
            type: 'umd',
        },
        path: resolvePath('libraryDist'),
        publicPath: '/',
        clean: true,
    },
    entry: join(resolvePath('src'), 'index.js'),
    target: 'node',
})
