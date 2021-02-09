import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: '',
  output: {
    dir: '',
    format: ''
  },
  plugins: [commonjs(), nodeResolve()]  
};
