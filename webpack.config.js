//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
	entry: {
		main: './index.js',
		DefaultParsers: './lib/DefaultParsers',
		DocReader: './lib/DocReader',
		DocResponse: './lib/DocResponse',
	},
	output: {
		globalObject: 'this',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'umd'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							[
								"@babel/preset-env",
								{
									"targets": {
										"node": true
									}
								}
							]
						],
						plugins: [
							"@babel/plugin-proposal-class-properties",
							[
								"@babel/plugin-proposal-pipeline-operator",
								{
									"proposal": "fsharp"
								}
							],
							"@babel/plugin-proposal-throw-expressions"
						]
					}
				},
			},
		],
	},
	target: 'node',
	plugins: [
		//new BundleAnalyzerPlugin(),
		new CleanWebpackPlugin(),
	],
	resolve: {
		extensions: [".js"],
	},
	externals: {
		lodash: {
			commonjs: 'lodash',
			commonjs2: 'lodash',
			amd: 'lodash',
			root: '_',
		},
	},
};