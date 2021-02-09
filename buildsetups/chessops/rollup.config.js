import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.js',
  external : [
    "@badrap/result"
  ],
  output: [
    {
      file: 'dist/chessops.js',
      format: 'iife',
      name: 'Chessops',
      globals: {
        "@badrap/result": "result"
      },
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    commonjs({
      extensions: ['.js', '.ts'],
    }),
  ],
};
