const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

const _BUILD_PATH_ = 'dist';

module.exports = {
	// Set entry point
	entry: './src/sdk/index.ts'
	
	// Set output path
	, output: {
		filename: 'index.js'
		, path: path.resolve(__dirname, _BUILD_PATH_)
	}
	
	// Set typescript loader 
	, module: {
		rules: [
			{ test: /\.ts$/, use: 'ts-loader' }
		]
	}
	
	// Set Plugin to create a copy of our test html page
	, plugins: [
		new HtmlWebpackPlugin({
			template: './src/test/index.html'
		})
		, new webpack.NamedModulesPlugin()
		, new webpack.HotModuleReplacementPlugin()
	]
	
	, devServer: {
		contentBase: _BUILD_PATH_
		, hot: true
	}
}