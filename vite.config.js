import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crawlSource } from './server/parser.mjs'

// 真实货源解析管道：把 /api/crawl 暴露为服务端接口（dev + preview 均生效）
function crawlApi() {
  const handler = (req, res, next) => {
    if (req.url.split('?')[0] !== '/api/crawl') return next()
    if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
    let body = ''
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy() })
    req.on('end', async () => {
      try {
        const { source, input } = JSON.parse(body || '{}')
        const result = await crawlSource({ source, input })
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(result))
      } catch (e) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ ok: false, real: false, error: e.message || String(e), note: '解析失败' }))
      }
    })
  }
  return {
    name: 'crawl-api',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages / 子路径部署用相对路径
  base: './',
  plugins: [react(), crawlApi()],
  server: {
    host: '0.0.0.0',
    port: 5176,
  },
  preview: {
    host: '0.0.0.0',
    port: 5176,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
