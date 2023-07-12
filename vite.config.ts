import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import checker from 'vite-plugin-checker'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      checker({
        vueTsc: true,
        stylelint: {
          lintCommand: 'stylelint ./src/**/*.{scss,vue}'
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    },
    server: {
      host: '0.0.0.0'
    },
    base: env.NODE_ENV === 'production' ? '/diablo4-map/' : '/'
  }
})
