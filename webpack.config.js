const path = require('path');

let config = {
  entry: './typescript/index.ts',
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
    filename: 'bundle.js'
  },
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.output.path = path.resolve(__dirname, 'src/scripts')
  }
  else if (argv.mode === 'production') {
    config.output.path = path.resolve(__dirname, 'prod/scripts')
  }

  return config
};