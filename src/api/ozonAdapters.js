// src/api/ozonAdapters.js
// Ozon API 响应适配器 - 全面实测版（2026-07-23）
// 所有适配函数均基于实际 API 响应结构编写
import {
  getOrders, getOrdersFBS, getProducts, getProductDetails, getProductStocks,
  getWarehouses, getSellerInfo, getAnalytics, getCategories,
  getReviews,
  fetchAllProducts,
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

// ---- 订单适配器（FBO + FBS 统一） ----
// FBO: result 直接是数组
// FBS: result.postings 是数组
export const adaptOrders = (postings = []) => postings.map(p => {
  const prods = p.products || []
  const total = prods.reduce((s, x) => s + num(x.price) * num(x.quantity), 0)
  const innerStatus = mapOzonStatus(p.status)
  return {
    id:          p.posting_number || p.order_number || '',
    orderId:     p.order_id || '',
    customer:    'Ozon 买家',
    product:     prods.map(pr => `${pr.name || '商品'} x${pr.quantity || 1}`).join('，') || '—',
    products:    prods.map(pr => ({
      name:       pr.name || '商品',
      sku:        pr.sku || '',
      offer_id:   pr.offer_id || '',
      quantity:   num(pr.quantity) || 1,
      price:      num(pr.price) || 0,
      currency:   pr.currency_code || 'CNY',
    })),
    items:       prods.reduce((s, x) => s + num(x.quantity), 0),
    total,
    currency:    prods[0]?.currency_code || 'CNY',
    status:      innerStatus,
    ozonStatus:  p.status || '',       // 保留原始Ozon状态用于Tab分组
    substatus:   p.substatus || '',     // Ozon 子状态（等待买家确认等）
    date:        isoDate(p.created_at),
    shipDate:    isoDate(p.shipment_date || p.ship_date) || '',
    deliverDate: isoDate(p.delivered_date) || '',
    address:     p.delivery_address || p.address || 'Ozon 配送',
    phone:       '—',
    tracking:    p.tracking_number || '—',
    note:        p.substatus ? `子状态: ${p.substatus}` : '',
    cancelReasonId: p.cancel_reason_id || 0,
    cancelReason:   p.cancel_reason || '',
    warehouse:   p.warehouse_id || '',
    deliveryMethod: (p.delivery_method && typeof p.delivery_method === 'object')
      ? (p.delivery_method.name || p.delivery_method.tpl_provider || JSON.stringify(p.delivery_method))
      : (p.delivery_method || ''),
    // 原始 payload，供调试/详情展示
    _raw:        p,
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

// 商品状态映射（Ozon statuses.status → 应用层语义）
// price_sent=已上传价格待生效, processed=可销售, moderate_failed=审核失败, archived=已归档
const OZON_PRODUCT_STATUS_MAP = {
  price_sent:    { app: 'active',      tab: 'active',     cn: '在售' },
  processed:     { app: 'active',      tab: 'active',     cn: '在售' },
  moderated:     { app: 'active',      tab: 'active',     cn: '在售' },
  moderating:    { app: 'moderating',  tab: 'moderating', cn: '审核中' },
  price_failed:  { app: 'price_error', tab: 'price_error',cn: '价格错误' },
  moderate_failed: { app: 'failed',    tab: 'failed',     cn: '审核失败' },
  failed:        { app: 'failed',      tab: 'failed',     cn: '创建失败' },
  archived:      { app: 'inactive',    tab: 'archived',   cn: '已归档' },
}
const mapProductStatus = (raw) => {
  const v = OZON_PRODUCT_STATUS_MAP[raw]
  if (v) return v
  // 默认映射：无状态视为已下架
  if (!raw) return { app: 'inactive', tab: 'inactive', cn: '未上架' }
  return { app: 'moderating', tab: 'moderating', cn: raw }
}

// ---- 商品详情适配器（v3/product/info/list） ----
// 实测响应: { items: [{ id, offer_id, name, price, old_price, currency_code,
//   primary_image: [...], images: [...], commissions: [...], stocks: {...},
//   statuses: { status, moderate_status, ... }, is_archived, ... }] }
export const adaptProductDetails = (items = []) => {
  const stockMap = {}
  const priceMap = {}
  items.forEach(it => {
    const pid = it.id || it.product_id
    // 库存：取 FBS + FBO 总和
    const allStocks = (it.stocks?.stocks || [])
    stockMap[pid] = allStocks.reduce((sum, s) => sum + num(s.present || 0), 0)
    // 价格
    priceMap[pid] = { price: num(it.price || 0), oldPrice: num(it.old_price || 0) }
  })

  return items.map(it => {
    const pid = it.id || it.product_id
    const commissions = it.commissions || []
    const fbsCommission = commissions.find(c => c.sale_schema === 'FBS')
    const fboCommission = commissions.find(c => c.sale_schema === 'FBO')
    const errors = (it.errors || []).filter(e => e.level === 'ERROR_LEVEL_ERROR')
    const rawStatus = it.statuses?.status || ''
    const mappedStatus = mapProductStatus(rawStatus)
    const primaryImg = Array.isArray(it.primary_image) ? it.primary_image[0]
                     : (typeof it.primary_image === 'string' && it.primary_image ? it.primary_image : '')
    const imgs = Array.isArray(it.images) ? it.images
               : (typeof it.images === 'string' && it.images ? it.images.split(' ') : [])
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
      image:       primaryImg || imgs[0] || '',
      images:      imgs,
      currency:    it.currency_code || 'CNY',
      categoryId:  it.description_category_id || 0,
      categoryName: '',     // 需要额外接口才能拿到类目名
      status:      mappedStatus.app,
      visibility:  rawStatus,
      statusText:  it.statuses?.status_name || mappedStatus.cn,
      moderateStatus: it.statuses?.moderate_status || '',
      archived:    it.is_archived || (it._is_archived_list ?? false),
      isDiscounted: it.is_discounted || false,
      // 佣金（用 percent 字段，与 Ozon 后台显示一致）
      commissionFBO: fboCommission?.percent ?? fboCommission?.value ?? 0,
      commissionFBS: fbsCommission?.percent ?? fbsCommission?.value ?? 0,
      // 重量
      volumeWeight: num(it.volume_weight),
      // 错误
      hasError:    errors.length > 0,
      errorCount:  errors.length,
      // 促销
      hasPromo:    (it.promotions || []).some(p => p.is_enabled),
      // 原始 payload
      _raw:        it,
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
      // dimensions 可能是字符串、字符串数组、或对象数组 {id, name}
      let dims = row.dimensions
      if (typeof dims === 'string') {
        dims = [dims]
      } else if (!Array.isArray(dims)) {
        dims = []
      }
      // 进一步标准化：每个元素如果是对象 {id, name}，提取 name
      dims = dims.map(d => {
        if (d === null || d === undefined) return '?'
        if (typeof d === 'object') {
          return d.name || d.id || String(d)
        }
        return String(d)
      })
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

  // 订单（默认只拉 FBS；通过 localStorage 'orderMode' 可选 'fbs' | 'fbo' | 'both'，默认 'fbs'）
  const orderMode = (() => { try { return localStorage.getItem('orderMode') || 'fbs' } catch { return 'fbs' } })()
  try {
    const calls = []
    if (orderMode === 'fbo' || orderMode === 'both') calls.push(getOrders())
    if (orderMode === 'fbs' || orderMode === 'both') calls.push(getOrdersFBS())
    const settled = await Promise.allSettled(calls)
    const fboList = (orderMode !== 'fbs' && settled[0]?.status === 'fulfilled')
      ? (Array.isArray(settled[0].value) ? settled[0].value : deepGet(settled[0].value, 'result') || [])
      : []
    const fbsSettledIdx = orderMode === 'fbo' ? 1 : 0
    const fbsList = settled[fbsSettledIdx]?.status === 'fulfilled'
      ? (deepGet(settled[fbsSettledIdx].value, 'result.postings') || [])
      : []
    // 合并并去重（按 posting_number）
    const merged = [...fboList, ...fbsList]
    const seen = new Set()
    const unique = merged.filter(o => {
      const id = o.posting_number || o.order_number
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
    results.orders = adaptOrders(unique)
    console.log(`[ERP] 订单加载: mode=${orderMode}, FBO=${fboList.length}, FBS=${fbsList.length}, 合并后=${unique.length}`)
  } catch (e) { console.warn('[ERP] 订单加载失败:', e.message) }

  // 商品（一次性拉列表+详情，超过 5000 个商品会被强制截断）
  try {
    const details = await fetchAllProducts({ visibility: 'ALL' })
    results.products = adaptProductDetails(details)
    console.log(`[ERP] 商品加载: ${details.length} 个`)
  } catch (e) { console.warn('[ERP] 商品加载失败:', e.message) }

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
