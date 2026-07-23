// server/parser.mjs
// 真实货源解析管道：在服务端（Node，无浏览器跨域限制）获取货源商品页并解析出结构化数据。
// 浏览器端无法直接请求 1688/淘宝/拼多多/京东，因此由服务端代理获取页面内容。
// 若货源站返回的内容不足以提取信息，解析结果会不完整，由前端回退到演示数据。

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const PLATFORMS = {
  '1688': { name: '1688', host: 'detail.1688.com' },
  taobao: { name: '淘宝', host: 'item.taobao.com' },
  pdd: { name: '拼多多', host: 'mobile.yangkeduo.com' },
  jd: { name: '京东', host: 'item.jd.com' },
}

function enc(s) {
  return encodeURIComponent(s)
}

function buildSearchUrl(source, kw) {
  switch (source) {
    case '1688': return `https://s.1688.com/s/offer_search.htm?keywords=${enc(kw)}`
    case 'taobao': return `https://s.taobao.com/search?q=${enc(kw)}`
    case 'pdd': return `https://mobile.yangkeduo.com/search_result.html?search_key=${enc(kw)}`
    case 'jd': return `https://search.jd.com/Search?keyword=${enc(kw)}&enc=utf-8`
    default: return `https://s.1688.com/s/offer_search.htm?keywords=${enc(kw)}`
  }
}

async function fetchText(url, referer) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12000)
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...(referer ? { Referer: referer } : {}),
      },
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.text()
  } finally {
    clearTimeout(timer)
  }
}

// 从页面提取 window.__INITIAL_STATE__ 等内嵌 JSON
function extractState(html) {
  const patterns = [
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/,
    /var\s+__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /window\._INITIAL_STATE_\s*=\s*(\{[\s\S]*?\});/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      try { return JSON.parse(m[1]) } catch (e) { /* ignore */ }
    }
  }
  return null
}

// 在对象中按候选键名深搜
export function deepFind(obj, keys, depth = 0) {
  if (obj == null || typeof obj !== 'object' || depth > 8) return undefined
  if (Array.isArray(obj)) {
    for (const it of obj) { const r = deepFind(it, keys, depth + 1); if (r !== undefined) return r }
    return undefined
  }
  for (const k of Object.keys(obj)) {
    if (keys.includes(k.toLowerCase())) return obj[k]
    const r = deepFind(obj[k], keys, depth + 1)
    if (r !== undefined) return r
  }
  return undefined
}

function meta(html, prop) {
  let m = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
  if (m) return m[1]
  m = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'))
  return m ? m[1] : ''
}

function cleanTitle(t) {
  if (!t) return ''
  let s = t.replace(/\s*[|_—-]\s*(京东|JD\.COM|淘宝网|Taobao|1688|阿里巴巴|拼多多|PDD|天猫|TMALL).*$/i, '').trim()
  return s.slice(0, 120)
}

function num(v) {
  const n = parseFloat(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// 从搜索结果页提取第一个商品链接
function firstItemUrl(source, html) {
  if (source === 'jd') {
    const m = html.match(/data-sku=["'](\d+)["']/)
    if (m) return `https://item.jd.com/${m[1]}.html`
  }
  if (source === '1688') {
    const m = html.match(/detail\.1688\.com\/offer\/(\d+)\.html/)
    if (m) return `https://detail.1688.com/offer/${m[1]}.html`
  }
  const m = html.match(/(https?:)?\/\/(item\.(taobao|tmall)\.com\/\w+\.htm|mobile\.yangkeduo\.com\/goods\.html\?goods_id=\d+)/)
  return m ? (m[0].startsWith('http') ? m[0] : 'https:' + m[0]) : ''
}

async function jdPrice(id) {
  try {
    const r = await fetch(`https://p.3.cn/prices/mgets?skuIds=J_${id}&type=1`, { headers: { 'User-Agent': UA } })
    const j = await r.json()
    if (Array.isArray(j) && j[0] && j[0].p) return num(j[0].p)
  } catch (e) { /* 价格接口不可达时忽略 */ }
  return 0
}

// 解析单个商品页
export function parseProductPage(source, html, url) {
  const state = extractState(html)
  const ogTitle = meta(html, 'og:title') || meta(html, 'og:product:title')
  const ogImage = meta(html, 'og:image') || meta(html, 'og:product:image')
  const ogPrice = meta(html, 'og:product:price:amount') || meta(html, 'og:price:amount')

  let title = ''
  if (state) title = deepFind(state, ['skuname', 'name', 'title', 'subject', 'productname']) || ''
  if (!title) title = ogTitle || cleanTitle((html.match(/<title>([^<]*)<\/title>/i) || [])[1])

  let price = ogPrice ? num(ogPrice) : 0
  if (!price && state) {
    const p = deepFind(state, ['price', 'actualprice', 'discountprice', 'begin', 'maxprice', 'skuprice'])
    if (p) price = num(p)
  }
  if (!price) {
    const m = html.match(/["']price["']\s*[:=]\s*["']?(\d+(?:\.\d+)?)/)
    if (m) price = num(m[1])
  }

  // 图片
  let images = []
  if (ogImage) images.push(ogImage)
  if (state) {
    const img = deepFind(state, ['imagelist', 'imagelistsl', 'offerimage', 'imageurls', 'imglist'])
    if (Array.isArray(img)) {
      img.slice(0, 6).forEach(it => {
        const u = typeof it === 'string' ? it : (it.big || it.small || it.url || it.src || it.original)
        if (u && /^https?:/.test(u)) images.push(u)
      })
    }
  }
  if (images.length === 0) {
    const all = html.match(/https?:\/\/[^"'<\s]+\.(?:jpg|jpeg|png|webp)/gi) || []
    images = all.slice(0, 6)
  }

  // 属性（变体/规格）best-effort
  let attrs = []
  if (state) {
    const sku = deepFind(state, ['skuprops', 'saleproperties', 'skuspec', 'props'])
    if (Array.isArray(sku)) {
      sku.slice(0, 6).forEach(sp => {
        const k = sp.prop || sp.name || sp.title
        const v = Array.isArray(sp.value) ? sp.value.map(x => x.name || x.value).join('/') : (sp.value || '')
        if (k && v) attrs.push({ k: String(k), v: String(v) })
      })
    }
  }

  const sku = (url.match(/(\d{6,})/) || [])[1] || ''
  return { title: String(title).slice(0, 160), price, currency: '¥', images: [...new Set(images)].slice(0, 6), attrs, sku }
}

// 入口：input 可为商品链接或关键词
export async function crawlSource({ source, input }) {
  const src = PLATFORMS[source] ? source : '1688'
  const raw = (input || '').trim()
  if (!raw) throw new Error('请输入商品链接或关键词')

  const isUrl = /^https?:\/\//i.test(raw)
  let url = isUrl ? raw : buildSearchUrl(src, raw)
  let html = await fetchText(url, url)
  let note = isUrl ? '直接解析商品链接' : '按关键词搜索并解析首个结果'

  // 关键词模式：从结果页取首个商品链接再获取详情
  if (!isUrl) {
    const itemUrl = firstItemUrl(src, html)
    if (itemUrl) {
      url = itemUrl
      html = await fetchText(itemUrl, url)
      note = '按关键词搜索，已定位首个商品并解析'
    } else {
      note = '结果页未解析到商品链接，已返回可提取信息'
    }
  }

  const data = parseProductPage(src, html, url)

  if (src === 'jd' && !data.price) {
    const id = (url.match(/(\d{6,})/) || [])[1]
    if (id) data.price = await jdPrice(id)
  }

  const real = !!(data.title || data.price || data.images.length)
  if (!real) note = '未能从货源页解析到完整信息，请改用商品链接或在浏览器扩展环境获取'

  return {
    ok: true,
    real,
    source: PLATFORMS[src].name,
    url,
    title: data.title,
    price: data.price,
    currency: data.currency,
    images: data.images,
    attrs: data.attrs,
    sku: data.sku,
    note,
  }
}
