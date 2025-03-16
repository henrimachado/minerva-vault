import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
plugins: [react()],
server: {
  host: true,
  port: 5173,
  watch: {
    usePolling: true,
  },
},
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@pages': '/src/pages',
    '@services': '/src/services',
    '@utils': '/src/utils',
    '@types': '/src/types',
    '@hooks': '/src/hooks',
    '@contexts': '/src/contexts',
    '@assets': '/src/assets',
  },
},
})