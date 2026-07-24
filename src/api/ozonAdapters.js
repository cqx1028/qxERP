// src/api/ozonAdapters.js
// Ozon API 响应适配器 - 全面实测版（2026-07-23）
// 所有适配函数均基于实际 API 响应结构编写
import {
  getOrders, getProducts, getProductDetails, getProductStocks,
  getWarehouses, getSellerInfo, getAnalytics, getCategories,
  getReviews,
} from './ozonApi'

// ---- 工具函数 ----
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const isoDate = (s) => (s ? String(s).slice(0, 10) : '')
const deepGet = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), obj)

// ---- 状态映射（兼容内部状态 + 保留原始Ozon状态）----
const OZON_STATUS_MAP = {
  delivered:             'delivered',   // 已签收
  cancelled:             'cancelled',   // 已取消
  cancelling:            'cancelled',   // 取消中
  delivering:            'shipped',     // 运输中
  awaiting_packaging:    'pending',     // 等待备货
  acceptance_in_progress:'processing', // 等待发货
  awaiting_deliver:      'shipped',     // 等待发货
  awaiting_registration: 'pending',     // 等待登记
  not_accepted:          'cancelled',   // 未接单
  pending:               'pending',
  awaiting:              'pending',
}
const mapOzonStatus = (s) => OZON_STATUS_MAP[s] || 'pending'

// ---- 店铺信息适配器 ----
export const adaptSellerInfo = (raw) => {
  const ratings = (raw?.ratings || []).map(r => ({
    name:    r.name || '—',
    value:   num(deepGet(r, 'current_value.value')),
    formatted: deepGet(r, 'current_value.formatted') || '—',
    type:    r.value_type || '—',
    status:  r.status || '—',
  }))
  const reviewScore = ratings.find(r => r.type === 'REVIEW_SCORE')
  const shipDelay = ratings.find(r => r.type?.includes('delay'))
  return {
    name:         raw?.company?.name || '—',
    legalName:    raw?.company?.legal_name || '—',
    inn:          raw?.company?.inn || '—',
    currency:     raw?.company?.currency || 'CNY',
    country:      raw?.company?.country || '—',
    premium:      raw?.subscription?.is_premium || false,
    // 评分
    reviewScore:  reviewScore?.formatted || '—',
    reviewScoreNum: reviewScore?.value || 0,
    shipDelayRate: shipDelay?.formatted || '—',
    // 原始评级列表（用于仪表盘）
    ratings,
  }
}

// ---- 订单适配器（v2/posting/fbo/list） ----
// 实测：result 直接是数组
export const adaptOrders = (postings = []) => postings.map(p => {
  const prods = p.products || []
  const total = prods.reduce((s, x) => s + num(x.price) * num(x.quantity), 0)
  const innerStatus = mapOzonStatus(p.status)
  return {
    id:          p.posting_number || p.order_number || '',
    orderId:     p.order_id || '',
    customer:    'Ozon 买家',
    product:     prods.map(pr => `${pr.name || '商品'} x${pr.quantity || 1}`).join('，') || '—',
    items:       prods.reduce((s, x) => s + num(x.quantity), 0),
    total,
    currency:    prods[0]?.currency_code || 'CNY',
    status:      innerStatus,
    ozonStatus:  p.status || '',       // 保留原始Ozon状态用于Tab分组
    date:        isoDate(p.created_at),
    address:     'Ozon 配送',
    phone:       '—',
    tracking:    p.tracking_number || '—',
    note:        p.substatus ? `子状态: ${p.substatus}` : '',
    cancelReasonId: p.cancel_reason_id || 0,
    warehouse:   p.warehouse_id || '',
    deliveryMethod: p.delivery_method || '',
  }
})

// ---- 商品列表适配器（v3/product/list） ----
// 仅含 ID/SKU/FBS 标志，无名称图片
export const adaptProductList = (items = []) => items.map(it => ({
  product_id:  it.product_id,
  offer_id:    it.offer_id || String(it.product_id),
  sku:         it.sku,
  archived:    it.archived || false,
  is_discounted: it.is_discounted || false,
  has_fbs:    it.has_fbs_stocks || false,
  has_fbo:    it.has_fbo_stocks || false,
}))

// ---- 商品详情适配器（v3/product/info/list） ----
// 含名称/价格/图片/库存/佣金/状态
export const adaptProductDetails = (items = []) => {
  const stockMap = {}
  const priceMap = {}
  items.forEach(it => {
    const pid = it.id || it.product_id
    // 库存：取 FBS stocks
    const fbsStocks = (it.stocks?.stocks || []).filter(s => s.source === 'fbs')
    const fbsStock = fbsStocks[0]
    stockMap[pid] = num(fbsStock?.present || 0)
    // 价格
    priceMap[pid] = { price: num(it.price || 0), oldPrice: num(it.old_price || 0) }
  })

  return items.map(it => {
    const pid = it.id || it.product_id
    const commissions = it.commissions || []
    const fbsCommission = commissions.find(c => c.sale_schema === 'FBS')
    const fboCommission = commissions.find(c => c.sale_schema === 'FBO')
    const errors = (it.errors || []).filter(e => e.level === 'ERROR_LEVEL_ERROR')

    return {
      id:          pid,
      product_id:  pid,
      name:        it.name || '未命名商品',
      offer_id:    it.offer_id || String(pid),
      sku:         it.sku,
      price:       priceMap[pid]?.price || 0,
      oldPrice:    priceMap[pid]?.oldPrice || 0,
      stock:       stockMap[pid] || 0,
      sold:        0,       // 商品列表不返回销量
      rating:      0,       // 商品列表不返回评分
      reviews:     0,       // 商品列表不返回评价数
      image:       it.primary_image?.[0] || it.images?.[0] || '',
      images:      it.images || [],
      currency:    it.currency_code || 'CNY',
      categoryId:  it.description_category_id || 0,
      status:      it.statuses?.status === 'price_sent' ? 'active' : 'inactive',
      visibility:  it.statuses?.status || '',
      statusText:  it.statuses?.status_name || '—',
      moderateStatus: it.statuses?.moderate_status || '',
      archived:    it.is_archived || false,
      isDiscounted: it.is_discounted || false,
      // 佣金
      commissionFBO: fboCommission?.value || fboCommission?.percent || 0,
      commissionFBS: fbsCommission?.value || fbsCommission?.percent || 0,
      // 重量
      volumeWeight: num(it.volume_weight),
      // 错误
      hasError:    errors.length > 0,
      errorCount:  errors.length,
      // 促销
      hasPromo:    (it.promotions || []).some(p => p.is_enabled),
    }
  })
}

// ---- 库存适配器（v4/product/info/stocks） ----
// 实测: { items: [{ product_id, offer_id, stocks: [...] }] }
export const adaptStocks = (raw = {}) => {
  const result = {}
  ;(raw.items || []).forEach(item => {
    const fbs = (item.stocks || []).find(s => s.source === 'fbs' || s.type === 'fbs')
    result[item.product_id] = num(fbs?.present || 0)
  })
  return result
}

// ---- 仓库适配器（v2/warehouse/list） ----
// 实测: { warehouses: [...] }
export const adaptWarehouses = (raw) => {
  const list = raw?.warehouses || []
  return list.map(w => ({
    id:       w.warehouse_id || w.id || '',
    name:     w.name || '仓库',
    location: w.city || w.address_info || '—',
    used:     0,
    capacity: 0,
    status:   w.status === 'created' ? 'active' : 'inactive',
    phone:    w.phone || '—',
    warehouse_type: w.warehouse_type || 'rfbs',
    is_rfbs:  w.is_rfbs || false,
  }))
}

// ---- 销售分析适配器（v1/analytics/data） ----
// 实测: { result: { data: [{ dimensions, metrics }] }, timestamp }
// dimensions 可能是字符串或数组
export const adaptAnalytics = (raw = {}) => {
  const data = raw?.result?.data || []
  const totals = raw?.result?.totals || []
  return {
    totalRevenue: num(totals[0]) || 0,
    rows: data.map(row => {
      // dimensions 可能是字符串或数组
      let dims = row.dimensions
      if (typeof dims === 'string') {
        dims = [dims]
      } else if (!Array.isArray(dims)) {
        dims = []
      }
      return {
        dimensions: dims,
        metrics:   row.metrics || [],
      }
    }),
    timestamp: raw?.timestamp || '',
  }
}

// ---- 类目适配器 ----
export const adaptCategories = (raw = []) => {
  const result = []
  const flatten = (cats, depth = 0) => {
    ;(cats || []).forEach(cat => {
      result.push({ id: cat.category_id, name: cat.name, depth })
      if (cat.children?.length) flatten(cat.children, depth + 1)
    })
  }
  flatten(Array.isArray(raw) ? raw : raw?.result || [])
  return result
}

// ---- 评价适配器（无权限时返回空） ----
export const adaptReviews = (raw = {}) => {
  const items = deepGet(raw, 'result.items') || deepGet(raw, 'items') || []
  return items.map(r => ({
    id:      String(r.id),
    type:    'review',
    title:   `评价 · ${r.rating || 0}★`,
    content: `${r.product_name || '商品'}：${(r.text || '').slice(0, 80)}`,
    time:    isoDate(r.created_at || r.published_at),
    read:    !!r.is_answer,
    rating:  num(r.rating),
    product: r.product_name,
  }))
}

// ---- 财务流水适配器 ----
export const adaptTransactions = (raw = {}) => {
  const ops = deepGet(raw, 'result.operations') || deepGet(raw, 'result') || []
  return ops.map((t, i) => ({
    id:         String(t.operation_id ?? i),
    type:       t.operation_type || t.type || 'unknown',
    title:      t.operation_type || t.title || '交易',
    amount:     num(t.amount),
    commission:  num(t.commission ?? t.commission_amount),
    date:       isoDate(t.operation_date || t.date),
    postingNum:  t.posting_number || '—',
    currency:    t.currency_code || 'CNY',
  }))
}

// ===========================
// 完整数据加载（所有模块并行）
// ===========================
export const loadRealData = async () => {
  const results = {
    sellerInfo: null,
    orders: [],
    products: [],
    warehouses: [],
    analytics: null,
    categories: [],
    reviews: [],
    transactions: [],
  }

  // 并行加载店铺信息 + 仓库（独立接口，无依赖）
  const [sellerInfoRes, warehousesRes, categoriesRes] = await Promise.allSettled([
    getSellerInfo(),
    getWarehouses(),
    getCategories(),
  ])

  if (sellerInfoRes.status === 'fulfilled') results.sellerInfo = sellerInfoRes.value
  if (warehousesRes.status === 'fulfilled') results.warehouses = adaptWarehouses(warehousesRes.value)
  if (categoriesRes.status === 'fulfilled') results.categories = adaptCategories(categoriesRes.value)

  // 订单（FBO，无需额外参数）
  try {
    const ordersRes = await getOrders()
    const list = Array.isArray(ordersRes) ? ordersRes : deepGet(ordersRes, 'result') || []
    results.orders = adaptOrders(list)
  } catch (e) { console.warn('[ERP] 订单加载失败:', e.message) }

  // 商品列表（v3，无名称）
  try {
    const listRes = await getProducts()
    const items = deepGet(listRes, 'result.items') || deepGet(listRes, 'result') || []
    results.products = adaptProductList(items)
  } catch (e) { console.warn('[ERP] 商品列表加载失败:', e.message) }

  // 商品详情（需要 offer_id 数组，分批 100 个）
  try {
    const listRes = await getProducts()
    const allItems = deepGet(listRes, 'result.items') || deepGet(listRes, 'result') || []
    const offerIds = allItems.map(i => i.offer_id).filter(Boolean)
    const details = []
    for (let i = 0; i < offerIds.length; i += 100) {
      const batch = offerIds.slice(i, i + 100)
      try {
        const batchRes = await getProductDetails(batch)
        const batchItems = batchRes?.items || batchRes?.result || []
        details.push(...batchItems)
      } catch (e) { console.warn(`[ERP] 商品详情第${Math.floor(i/100)+1}批失败:`, e.message) }
    }
    results.products = adaptProductDetails(details)
  } catch (e) { console.warn('[ERP] 商品详情加载失败:', e.message) }

  // 销售分析
  try {
    const analyticsRes = await getAnalytics({ dimensions: ['sku'], limit: 100 })
    results.analytics = adaptAnalytics(analyticsRes)
  } catch (e) { console.warn('[ERP] 销售分析加载失败:', e.message) }

  // 评价（无权限时返回空列表）
  try {
    const reviewsRes = await getReviews()
    results.reviews = adaptReviews(reviewsRes)
  } catch (e) {
    console.warn('[ERP] 评价（无权限）:', e.message)
    results.reviews = []
  }

  return results
}
