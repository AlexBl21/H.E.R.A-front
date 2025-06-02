import path from 'path';
import checker from 'vite-plugin-checker';
import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------


export default ({ mode }: ConfigEnv): UserConfigExport  => {
  const env = loadEnv(mode, process.cwd());
 return  defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
      port: parseInt(env.VITE_PORT),
      host: true,
      cors: true,
    },
    preview: {
      port: parseInt(env.VITE_PORT),
      host: true,
      cors: true,
    },
});
};