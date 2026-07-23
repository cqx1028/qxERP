// src/api/ozonApi.js
// Ozon Seller API 集成 - 全面实测版（2026-07-23 实测验证）
const OZON_API_BASE = 'https://api-seller.ozon.ru'

export const OZON_ENDPOINTS = {
  // 订单
  ordersFBO:      '/v2/posting/fbo/list',
  // 商品
  productList:    '/v3/product/list',       // ✅ 实测成功
  productInfoList: '/v3/product/info/list',  // ✅ 实测成功
  // 库存
  stocks:         '/v4/product/info/stocks', // ✅ 实测成功
  // 仓库
  warehouses:     '/v2/warehouse/list',      // ✅ 实测成功
  // 财务流水
  transactions:   '/v3/finance/transaction/list',
  // 销售分析
  analytics:      '/v1/analytics/data',     // ✅ 实测成功
  // 店铺信息
  sellerInfo:     '/v1/seller/info',        // ✅ 实测成功
  // 类目
  categories:     '/v1/description-category/tree', // ✅ 实测成功
  // 评价（免费版无权限）
  reviews:        '/v1/review/list',
}

const getCredentials = () => {
  try { return JSON.parse(localStorage.getItem('ozonApiConfig') || '{}') } catch { return {} }
}

export const ozonRequest = async (endpoint, body = {}, options = {}) => {
  const { clientId, apiKey } = getCredentials()
  if (!clientId || !apiKey) throw new Error('请先在系统设置中配置 Client-Id 和 Api-Key')
  const res = await fetch(OZON_API_BASE + endpoint, {
    method: options.method || 'POST',
    headers: { 'Client-Id': clientId, 'Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: (options.method || 'POST') === 'GET' ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`${res.status}: ${text.slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

// ---- 订单（FBO） ----
/** FBO 订单列表：result 直接是数组 */
export const getOrders = (params = {}) =>
  ozonRequest(OZON_ENDPOINTS.ordersFBO, { limit: 50, offset: 0, ...params })

// ---- 商品列表 ----
/** v3/product/list：返回 { result: { items: [...] } } */
export const getProducts = (params = {}) =>
  ozonRequest(OZON_ENDPOINTS.productList, { filter: {}, limit: 100, offset: 0, ...params })

// ---- 商品详情（批量） ----
/** v3/product/info/list：入参 offer_id[] 或 product_id[] */
export const getProductDetails = (offerIds = []) =>
  ozonRequest(OZON_ENDPOINTS.productInfoList, { offer_id: offerIds })

// ---- 商品库存 ----
/** v4/product/info/stocks：返回 stocks[].present */
export const getProductStocks = (productIds = []) =>
  ozonRequest(OZON_ENDPOINTS.stocks, { product_id: productIds })

// ---- 仓库列表 ----
/** v2/warehouse/list：返回 { warehouses: [...] } */
export const getWarehouses = () =>
  ozonRequest(OZON_ENDPOINTS.warehouses, {})

// ---- 财务流水（按 posting_number 查询单笔，或 date 范围） ----
/** 流水列表：需指定 posting_number 或 date 范围 */
export const getTransactions = (params = {}) => {
  const to = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const body = {
    filter: { date_from: from, date_to: to, posting_number: params.posting_number || '' },
    page: params.page || 1,
    page_size: params.page_size || 50,
    ...params,
  }
  // 无 posting_number 时不传该字段（避免触发"empty"校验）
  if (!params.posting_number) delete body.filter.posting_number
  return ozonRequest(OZON_ENDPOINTS.transactions, body)
}

// ---- 销售分析 ----
/** 按 sku 维度汇总销售数据 */
export const getAnalytics = (params = {}) => {
  const to = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  return ozonRequest(OZON_ENDPOINTS.analytics, {
    date_from: from,
    date_to: to,
    dimensions: params.dimensions || ['sku'],
    metrics: params.metrics || ['revenue', 'orders', 'units', 'returns'],
    limit: params.limit || 100,
    ...params,
  })
}

// ---- 店铺信息 ----
/** v1/seller/info：返回公司、评级等 */
export const getSellerInfo = () => ozonRequest(OZON_ENDPOINTS.sellerInfo, {})

// ---- 类目树 ----
/** v1/description-category/tree：26个类目 */
export const getCategories = () => ozonRequest(OZON_ENDPOINTS.categories, {})

// ---- 评价（免费版无权限，返回 PermissionDenied） ----
export const getReviews = (params = {}) =>
  ozonRequest(OZON_ENDPOINTS.reviews, { limit: 20, offset: 0, ...params })

// ---- 测试连接 ----
// ---- 类目佣金查询 ----
/** 按类目 ID 查询佣金费率（从类目树中匹配） */
export const getCommissions = async (catId) => {
  const cats = await getCategories()
  const flat = []
  const flatten = (list, depth = 0) => {
    ;(list || []).forEach(c => { flat.push(c); if (c.children?.length) flatten(c.children, depth + 1) })
  }
  flatten(Array.isArray(cats) ? cats : cats?.result || [])
  return flat.find(c => String(c.category_id) === String(catId)) || null
}

export const testConnection = () => ozonRequest('/v1/roles', {})
