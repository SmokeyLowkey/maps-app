import {resolve} from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

export default defineConfig({
  root,
  base: '/',
  plugins: [react()],
  build:{
    outDir,
    emptyOutDir: true,
    rollupOptions:{
      input:{
        main: resolve(root, 'index.html'),
        scene: resolve(root, 'scene/index.html')
      }
    }
  }

})