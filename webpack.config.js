const path = require('path');

module.exports = {
    entry: './src/public-api.ts',
    devtool: 'inline-source-map',
    target: 'node',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'bundle.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: {
        '@google-cloud/firestore': 'commonjs2 @google-cloud/firestore',
    },
};
