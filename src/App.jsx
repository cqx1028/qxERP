import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './index.css'
import LoginGate from './components/LoginGate'
import { testConnection } from './api/ozonApi'
import { loadRealData } from './api/ozonAdapters'
import { getCommissions } from './api/ozonApi'

// ==================== 图标组件 ====================
const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    shop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    uploadFast: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
        <path d="M8 15h8"/>
      </svg>
    ),
    spider: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M12 12v4M8 16l-3 4M16 16l3 4M12 16l-2 4M12 16l2 4"/>
      </svg>
    ),
    history: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    ),
    products: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
      </svg>
    ),
    inventory: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
        <path d="M10 12h4"/>
      </svg>
    ),
    warehouse: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="2"/>
        <path d="M4 8h16M8 8v13M16 8v13"/>
      </svg>
    ),
    orders: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h6"/>
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    promotion: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    research: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    variant: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    bundle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    ),
    truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
    trending: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    money: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    filter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    info: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    moon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
    sun: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
    language: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    printer: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
    ),
    fileText: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    link: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    help: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    message: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
  }
  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[name] || icons.info}</span>
}

// ==================== 全局 Toast 提示 ====================
let __toastSeq = 0
const showToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('ozon-toast', { detail: { id: ++__toastSeq, message, type } }))
}
const ToastHost = () => {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const handler = (e) => {
      const t = e.detail
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3200)
    }
    window.addEventListener('ozon-toast', handler)
    return () => window.removeEventListener('ozon-toast', handler)
  }, [])
  const palette = {
    success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-yellow-600', info: 'bg-gray-800',
  }
  const iconMap = { success: 'check', error: 'x', warning: 'info', info: 'info' }
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`${palette[t.type] || palette.info} text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-slide-up`}>
          <Icon name={iconMap[t.type] || 'info'} size={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ==================== 数据持久化 Hook ====================
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// ==================== 常量定义 ====================
const statusMap = {
  pending:    { label: '等待备货',   color: 'bg-yellow-100 text-yellow-800',  dot: 'bg-yellow-400' },
  processing: { label: '等待发货',   color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400' },
  shipped:    { label: '运输中',     color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400' },
  delivered:  { label: '已签收',     color: 'bg-green-100 text-green-800',  dot: 'bg-green-400' },
  cancelled:  { label: '已取消',     color: 'bg-red-100 text-red-800',     dot: 'bg-red-400' },
  success:    { label: '成功',       color: 'bg-green-100 text-green-800',  dot: 'bg-green-400' },
  failed:     { label: '失败',       color: 'bg-red-100 text-red-800',     dot: 'bg-red-400' },
  active:     { label: '进行中',     color: 'bg-green-100 text-green-800',  dot: 'bg-green-400' },
  ended:      { label: '已结束',     color: 'bg-gray-100 text-gray-800',    dot: 'bg-gray-400' },
  disputed:   { label: '有争议',     color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-400' },
}

// ==================== CSV 导出工具 ====================
const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h]
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

// ==================== Excel 导出工具（原生 .xls，Excel 可直接打开） ====================
const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) return
  const escapeCell = (v) => {
    const s = v === undefined || v === null ? '' : String(v)
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
  const headers = Object.keys(data[0])
  const headRow = `<tr>${headers.map(h => `<th>${escapeCell(h)}</th>`).join('')}</tr>`
  const bodyRows = data.map(row => `<tr>${headers.map(h => `<td>${escapeCell(row[h])}</td>`).join('')}</tr>`).join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/1999/xhtml"><head><meta charset="UTF-8"></head><body><table border="1">${headRow}${bodyRows}</table></body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = String(filename).replace(/\.csv$/i, '') + '.xls'
  link.click()
}

// ==================== 顶部工具栏 ====================
const TopToolbar = ({ onRefresh, loading, sellerInfo, autoRefresh, setAutoRefresh, countdown, lastRefreshTime }) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-between text-sm">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🐱</span>
        <span className="font-bold">{sellerInfo?.name || '布丁猫'} Ozon ERP</span>
        {sellerInfo?.inn && <span className="text-blue-200 text-xs">| {sellerInfo.inn}</span>}
        {sellerInfo?.premium && <span className="text-yellow-300 text-xs">★ Premium</span>}
      </div>
      <div className="h-4 w-px bg-blue-400" />
      <button onClick={() => showToast('选品分析：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="search" size={14} />
        <span>选品分析</span>
      </button>
      <button onClick={() => showToast('意见反馈：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="message" size={14} />
        <span>意见反馈</span>
      </button>
      <button onClick={() => showToast('打印驱动：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="printer" size={14} />
        <span>打印驱动</span>
      </button>
      <button onClick={() => showToast('使用帮助：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="help" size={14} />
        <span>使用帮助</span>
      </button>
      <button onClick={() => showToast('物流查询：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="truck" size={14} />
        <span>物流查询</span>
      </button>
      <button onClick={() => showToast('最新资讯：演示入口，敬请期待', 'info')} className="flex items-center gap-1 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
        <Icon name="info" size={14} />
        <span>最新资讯</span>
      </button>
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onRefresh} disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-50"
        title="从 Ozon 拉取最新数据">
        <Icon name="refresh" size={14} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? '同步中' : '刷新数据'}</span>
      </button>
      {autoRefresh && (
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-2 h-2 rounded-full ${countdown <= 5 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-white/70">{countdown}s</span>
        </div>
      )}
      <button onClick={() => setAutoRefresh(!autoRefresh)} disabled={loading}
        className={`text-xs px-2 py-1 rounded transition-colors ${autoRefresh ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-white/10 hover:bg-white/20'}`}
        title={autoRefresh ? '暂停自动刷新' : '开启自动刷新'}>
        {autoRefresh ? '⏸ 暂停' : '▶ 自动'}
      </button>
      {lastRefreshTime && (
        <span className="text-xs text-white/60" title={new Date(lastRefreshTime).toLocaleString()}>
          同步于 {new Date(lastRefreshTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        🟢 真实API
      </span>
      {sellerInfo?.reviewScore && (
        <span className="text-yellow-300 text-xs">⭐ {sellerInfo.reviewScore}</span>
      )}
      <div className="flex items-center gap-1">
        <span className="text-yellow-300">🪙</span>
        <span className="font-bold">8000</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="user" size={16} />
        <span>19396067405</span>
      </div>
      <button
        onClick={() => window.__qxerpLogout && window.__qxerpLogout()}
        title="退出登录"
        className="ml-2 px-2 py-1 rounded hover:bg-white/20 text-xs flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出
      </button>
    </div>
  </div>
)

// ==================== 侧边栏组件 ====================
const Sidebar = ({ active, setActive }) => {
  const menu = [
    { key: 'dashboard', label: '当前状态', icon: 'dashboard' },
    { key: 'shop', label: '店铺管理', icon: 'shop' },
    { key: 'uploadFast', label: '快速上货', icon: 'uploadFast' },
    { key: 'crawl', label: '采集上货', icon: 'spider' },
    { key: 'crawlHistory', label: '采集上传记录', icon: 'history' },
    { key: 'products', label: '商品管理', icon: 'products' },
    { key: 'relist', label: '下架重上', icon: 'refresh' },
    { key: 'inventory', label: '库存管理', icon: 'inventory' },
    { key: 'warehouse', label: '仓库管理', icon: 'warehouse' },
    { key: 'orders', label: '订单管理', icon: 'orders' },
    { key: 'logistics', label: '物流查询', icon: 'truck' },
    { key: 'notifications', label: '消息提醒', icon: 'bell' },
    { key: 'promotions', label: '活动管理', icon: 'promotion' },
    { key: 'analytics', label: '数据分析', icon: 'analytics' },
    { key: 'research', label: '选品分析', icon: 'research' },
    { key: 'variant', label: '变体套餐', icon: 'variant' },
    { key: 'settings', label: '系统设置', icon: 'settings' },
  ]
  return (
    <aside className="w-48 bg-white border-r border-gray-200 flex flex-col h-full min-h-0">
      <nav className="flex-1 py-2 overflow-y-auto">
        {menu.map(item => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              active === item.key
                ? 'bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

// ==================== 统计卡片 ====================
const StatCard = ({ icon, label, value, sub, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-teal-600',
    yellow: 'from-amber-400 to-orange-500',
    red: 'from-red-500 to-rose-600',
    purple: 'from-violet-500 to-purple-600',
  }
  const iconBg = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-violet-100 text-violet-600',
  }
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          <Icon name={icon} size={20} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <Icon name={trend >= 0 ? 'trending' : 'trendingDown'} size={12} />
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ==================== 骨架屏组件 ====================
const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded ${className}`} />
)

// ==================== 仪表盘页面 ====================
const Dashboard = ({ orders, products, sellerInfo, analytics }) => {
  // 加载中无数据 → 骨架屏
  const loading = !orders?.length && !sellerInfo
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">
          <SkeletonBlock className='h-7 w-32' />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <SkeletonBlock className='w-10 h-10 rounded-lg' />
              </div>
              <SkeletonBlock className='h-8 w-20 mb-1' />
              <SkeletonBlock className='h-3 w-16' />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <SkeletonBlock className='h-5 w-24 mb-4' />
              <SkeletonBlock className='h-32 w-full' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayOrders = orders.filter(o => (o.date || '').startsWith(todayStr)).length
  // 真实数据：从 analytics 取 30 天总收入；否则从订单算
  const totalRevenue = analytics?.totalRevenue
    || orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total || 0), 0)
  const avgRating = sellerInfo?.reviewScore || (products.reduce((s, p) => s + parseFloat(p.rating || 0), 0) / Math.max(products.length, 1)).toFixed(1)

  // 最近 30 天订单趋势
  const today = new Date()
  const dayKeys = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (29 - i)); return d.toISOString().slice(0, 10)
  })
  const days = dayKeys.map(k => new Date(k).getDate())
  const orderData = dayKeys.map(k => orders.filter(o => (o.date || '').slice(0, 10) === k).length)
  // 上货趋势：按 analytics 行数生成
  const uploadData = analytics?.rows?.length
    ? dayKeys.map((_, i) => Math.min(100, Math.max(0, Math.round(analytics.rows.length * (1 - i / 30) * 0.5))))
    : dayKeys.map(() => Math.floor(Math.random() * 100))
  const maxOrder = Math.max(...orderData, 1)
  const maxUpload = Math.max(...uploadData, 1)

  // 真实数据时显示店铺信息
  const shopName = sellerInfo?.name || '布丁猫'
  const inn = sellerInfo?.inn || ''
  const currency = sellerInfo?.currency || 'CNY'

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      {/* 欢迎横幅 */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-7 space-y-3 shadow-lg">
        <h1 className="text-2xl font-bold">
          {inn ? (
            <>{shopName} <span className="text-blue-200 text-base font-normal">/ {inn}</span></>
          ) : (
            <>欢迎回来，布丁猫祝您早日成为 OZON 大卖!!!</>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
            🟢 真实数据
          </span>
          {sellerInfo && (
            <>
              <span className="text-xs text-white/60">|</span>
              <span className="text-xs text-white/80">店铺评分: {avgRating} ⭐</span>
              {sellerInfo.shipDelayRate && <span className="text-xs text-white/60">配送延迟: {sellerInfo.shipDelayRate}</span>}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 订单趋势 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              30天订单趋势
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{orders.length} 个订单</span>
          </div>
          <div className="h-48 flex items-end gap-[2px]">
            {orderData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group-bar">
                <div className="w-full rounded-t cursor-pointer transition-all duration-150"
                  style={{
                    height: `${Math.max((v / maxOrder) * 100, v > 0 ? 2 : 0)}%`,
                    minHeight: v > 0 ? '3px' : '0',
                    background: v > 0 ? `linear-gradient(to top, #3b82f6, #60a5fa)` : 'transparent'
                  }}
                  title={`${dayKeys[i]}: ${v}单`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            {days.filter((_, i) => i % 5 === 0).map(d => <span key={d} className="font-medium">{d}日</span>)}
          </div>
        </div>

        {/* 上货趋势 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              30天上货趋势
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{products.length} 个商品</span>
          </div>
          <div className="h-48 flex items-end gap-[2px]">
            {uploadData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t cursor-pointer transition-all duration-150"
                  style={{
                    height: `${Math.max((v / maxUpload) * 100, v > 0 ? 2 : 0)}%`,
                    minHeight: v > 0 ? '3px' : '0',
                    background: v > 0 ? `linear-gradient(to top, #10b981, #34d399)` : 'transparent'
                  }}
                  title={`${dayKeys[i]}: ${v}件`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            {days.filter((_, i) => i % 5 === 0).map(d => <span key={d} className="font-medium">{d}日</span>)}
          </div>
        </div>
      </div>

      {/* 快捷统计 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="orders" label="待处理订单" value={pendingOrders} trend={pendingOrders > 0 ? 1 : 0} color="yellow" />
        <StatCard icon="cart" label="今日订单" value={todayOrders} trend={todayOrders > 0 ? 1 : 0} color="blue" />
        <StatCard icon="money" label="30天收入" value={currency === 'CNY' ? `¥${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `₽${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} trend={15} color="green" />
        <StatCard icon="star" label="店铺评分" value={`${avgRating} ⭐`} trend={0} color="purple" />
      </div>
    </div>
  )
}

// ==================== 快速上货页面 ====================
const UploadFast = ({ products, setProducts }) => {
  const [urls, setUrls] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = () => {
    if (!urls.trim()) { showToast('请输入至少一个商品链接', 'error'); return }
    setUploading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return p + 10
      })
    }, 200)
  }

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">快速上货</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">商品链接（每行一个）</label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://...&#10;https://...&#10;https://..."
              className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>上传进度</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading || !urls.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="upload" size={16} />
              {uploading ? '上传中...' : '开始上货'}
            </button>
            <button
              onClick={() => setUrls('')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 上货模板 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">批量上货模板</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="text-left px-3 py-2">商品名称</th>
                <th className="text-left px-3 py-2">SKU</th>
                <th className="text-left px-3 py-2">价格</th>
                <th className="text-left px-3 py-2">库存</th>
                <th className="text-left px-3 py-2">分类</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((p, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span>{p.image}</span>
                    <span className="truncate max-w-[150px]">{p.name}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{p.sku}</td>
                  <td className="px-3 py-2">₽{p.price}</td>
                  <td className="px-3 py-2">{p.stock}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="px-3 py-2">
                    <button className="text-blue-600 hover:text-blue-700 text-xs">编辑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== 采集上货页面 ====================
const Crawl = ({ setProducts, setCrawlHistory }) => {
  const [source, setSource] = useState('1688')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [real, setReal] = useState(false)

  const sources = [
    { id: '1688', name: '1688', color: 'bg-orange-500' },
    { id: 'taobao', name: '淘宝', color: 'bg-orange-400' },
    { id: 'pdd', name: '拼多多', color: 'bg-red-500' },
    { id: 'jd', name: '京东', color: 'bg-red-600' },
  ]
  const sourceName = (id) => (sources.find(s => s.id === id) || {}).name || id

  const handleParse = async () => {
    if (!keyword.trim()) { showToast('请输入商品链接或关键词', 'error'); return }
    setLoading(true); setPreview(null); setReal(false)
    try {
      const r = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, input: keyword.trim() }),
      })
      const data = await r.json()
      if (data && data.ok && data.real) {
        setPreview({
          title: data.title,
          price: data.price,
          source: data.source,
          image: data.images && data.images[0] ? data.images[0] : '🛒',
          imageIsUrl: !!(data.images && data.images[0]),
          attrs: data.attrs && data.attrs.length ? data.attrs : [{ k: '链接', v: data.url }],
          sku: data.sku,
          note: data.note,
        })
        setReal(true)
        showToast('已真实解析货源商品', 'success')
      } else {
        setPreview(null)
        setReal(false)
        showToast((data && data.note) || '未能解析该货源，请检查链接是否正确', 'warning')
      }
    } catch (e) {
      setPreview(null); setReal(false)
      showToast('解析服务不可用，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (!preview) return
    const id = 'P' + Date.now()
    setProducts(prev => [{
      id, name: preview.title, sku: 'CR-' + Math.floor(Math.random() * 9000 + 1000),
      price: preview.price, stock: 0, sold: 0, rating: 0, reviews: 0,
      status: 'active', image: '📦', cost: Math.floor(preview.price * 0.6), category: '采集商品',
    }, ...prev])
    if (setCrawlHistory) {
      setCrawlHistory(prev => [{
        id: 'CR-' + Date.now(), source: preview.source, url: keyword, productName: preview.title,
        status: 'success', date: new Date().toLocaleString('zh-CN'), price: preview.price, stock: 0,
      }, ...prev])
    }
    showToast('已导入到商品库，可在「商品管理」查看', 'success')
    setPreview(null); setKeyword('')
  }

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">采集上货 · 一键跟卖</h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">选择采集平台</label>
          <div className="flex gap-2">
            {sources.map(s => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  source === s.id ? `${s.color} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{s.name}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="粘贴商品链接或输入关键词…"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleParse}
            disabled={loading || !keyword.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Icon name={loading ? 'refresh' : 'spider'} size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? '解析中...' : '解析商品'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-3xl overflow-hidden shrink-0">
              {preview.imageIsUrl ? <img src={preview.image} alt="" className="w-full h-full object-cover" /> : preview.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-800 truncate">{preview.title || '（未解析到标题）'}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${real ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{real ? '真实解析' : '演示数据'}</span>
              </div>
              <div className="text-blue-600 font-semibold mt-1">{real ? '¥' : '₽'}{preview.price}</div>
              {preview.note && <div className="mt-1 text-xs text-gray-400">{preview.note}</div>}
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {preview.attrs.map((a, i) => (
                  <div key={i} className="flex gap-2"><span className="text-gray-400 w-12 shrink-0">{a.k}</span><span className="truncate">{a.v}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleImport} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">导入到商品库</button>
            <button onClick={handleParse} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">重新解析</button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. 选择要采集的商品来源平台（1688 / 淘宝 / 拼多多 / 京东）</li>
          <li>2. 粘贴商品链接或输入关键词，点击「解析商品」</li>
          <li>3. 确认预览信息后点击「导入到商品库」</li>
          <li>4. 导入的商品可在「商品管理」中编辑上架；记录见「采集上传记录」</li>
          <li className="text-blue-500">* 解析走服务端代理真实获取货源页（1688/淘宝/拼多多/京东）；若货源站返回内容不足则回退演示数据</li>
        </ul>
      </div>
    </div>
  )
}

// ==================== 采集上传记录页面 ====================
const CrawlHistory = ({ history }) => {
  const [filter, setFilter] = useState('all')

  const filtered = history.filter(h => filter === 'all' || h.status === filter)

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">采集上传记录</h3>
          <div className="flex gap-2">
            {['all', 'success', 'pending', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '全部' : f === 'success' ? '成功' : f === 'pending' ? '进行中' : '失败'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="text-left px-3 py-2">来源平台</th>
                <th className="text-left px-3 py-2">商品名称</th>
                <th className="text-left px-3 py-2">价格</th>
                <th className="text-left px-3 py-2">库存</th>
                <th className="text-left px-3 py-2">状态</th>
                <th className="text-left px-3 py-2">采集时间</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                      h.source === '1688' ? 'bg-orange-500' :
                      h.source === '淘宝' ? 'bg-orange-400' :
                      h.source === '拼多多' ? 'bg-red-500' : 'bg-red-600'
                    }`}>
                      {h.source}
                    </span>
                  </td>
                  <td className="px-3 py-2 truncate max-w-[200px]">{h.productName}</td>
                  <td className="px-3 py-2">¥{h.price}</td>
                  <td className="px-3 py-2">{h.stock}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusMap[h.status]?.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMap[h.status]?.dot}`} />
                      {statusMap[h.status]?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{h.date}</td>
                  <td className="px-3 py-2">
                    <button className="text-blue-600 hover:text-blue-700 text-xs">查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== 下架重上页面 ====================
const Relist = ({ products, setProducts }) => {
  const [selected, setSelected] = useState([])

  const inactiveProducts = products.filter(p => p.status === 'inactive')

  const handleRelist = () => {
    setProducts(prev => prev.map(p => 
      selected.includes(p.id) ? { ...p, status: 'active' } : p
    ))
    setSelected([])
  }

  const toggleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">下架重上</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRelist}
              disabled={selected.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Icon name="refresh" size={14} />
              批量重上 ({selected.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="text-left px-3 py-2">
                  <input 
                    type="checkbox" 
                    checked={selected.length === inactiveProducts.length && inactiveProducts.length > 0}
                    onChange={() => setSelected(selected.length === inactiveProducts.length ? [] : inactiveProducts.map(p => p.id))}
                    className="rounded"
                  />
                </th>
                <th className="text-left px-3 py-2">商品</th>
                <th className="text-left px-3 py-2">SKU</th>
                <th className="text-left px-3 py-2">价格</th>
                <th className="text-left px-3 py-2">下架时间</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {inactiveProducts.map((p, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center text-lg overflow-hidden">
                      {p.image && p.image.startsWith('http') ? (
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.image || '📦'}</span>
                      )}
                    </span>
                    <span className="truncate max-w-[150px]">{p.name}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{p.sku}</td>
                  <td className="px-3 py-2">₽{p.price}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">2026-07-20 15:30</td>
                  <td className="px-3 py-2">
                    <button 
                      onClick={() => setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, status: 'active' } : pr))}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      立即重上
                    </button>
                  </td>
                </tr>
              ))}
              {inactiveProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                    暂无下架商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== 仓库管理页面 ====================
const Warehouse = ({ warehouses }) => {
  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">仓库管理</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Icon name="plus" size={14} />
          添加仓库
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800">{w.name}</h4>
                <p className="text-sm text-gray-500">{w.location}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {w.status === 'active' ? '运营中' : '暂停'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">容量使用</span>
                  <span className="font-medium">{w.used} / {w.capacity}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(w.used / w.capacity) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">负责人：</span>
                <span className="font-medium">{w.manager}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">电话：</span>
                <span className="font-medium">{w.phone}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">编辑</button>
              <button className="flex-1 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">库存</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 消息提醒页面 ====================
const Notifications = ({ notifications: initialNotifications }) => {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const typeIcons = {
    order: '📦',
    stock: '⚠️',
    review: '💬',
    promotion: '🎉',
  }

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">消息提醒</h3>
        <button 
          onClick={markAllAsRead}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          全部标记为已读
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            onClick={() => markAsRead(n.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              n.read 
                ? 'bg-white border-gray-200' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeIcons[n.type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-800">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                <p className="text-xs text-gray-400 mt-2">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 活动管理页面 ====================
const Promotions = ({ promotions }) => {
  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">活动管理</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Icon name="plus" size={14} />
          创建活动
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {promotions.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-800">{p.name}</h4>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${statusMap[p.status]?.color}`}>
                  {statusMap[p.status]?.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{p.discount}%</div>
                <div className="text-xs text-gray-400">折扣</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">活动时间</span>
                <span className="text-gray-700">{p.startDate} ~</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500"></span>
                <span className="text-gray-700">{p.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">参与商品</span>
                <span className="font-medium">{p.products} 件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">活动销量</span>
                <span className="font-medium text-green-600">{p.sales} 单</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">编辑</button>
              <button className="flex-1 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">数据</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 订单管理页面（7状态Tab + 自动拉取） ====================
const Orders = ({ orders, setOrders, onRefresh, isLoading }) => {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  // 7状态Tab统计（Ozon真实状态）
  const counts = {
    all: orders.length,
    pending: orders.filter(o => ['pending', 'awaiting_packaging', 'awaiting_registration'].includes(o.ozonStatus)).length,
    processing: orders.filter(o => ['processing', 'acceptance_in_progress'].includes(o.ozonStatus)).length,
    shipped: orders.filter(o => ['shipped', 'delivering', 'awaiting_deliver'].includes(o.ozonStatus)).length,
    delivered: orders.filter(o => o.ozonStatus === 'delivered').length,
    disputed: orders.filter(o => ['dispute', 'disputed'].includes(o.ozonStatus)).length,
    cancelled: orders.filter(o => ['cancelled', 'cancelling', 'not_accepted'].includes(o.ozonStatus)).length,
  }

  // 过滤逻辑：优先按ozonStatus分组，其次按innerStatus兜底
  const ozonStatusGroup = {
    all:       () => true,
    pending:    o => ['pending','awaiting_packaging','awaiting_registration'].includes(o.ozonStatus),
    processing: o => ['processing','acceptance_in_progress'].includes(o.ozonStatus),
    shipped:    o => ['shipped','delivering','awaiting_deliver'].includes(o.ozonStatus),
    delivered:  o => o.ozonStatus === 'delivered',
    disputed:   o => ['dispute','disputed'].includes(o.ozonStatus),
    cancelled:  o => ['cancelled','cancelling','not_accepted'].includes(o.ozonStatus),
  }

  const filtered = orders.filter(o => {
    if (!ozonStatusGroup[filter]?.(o)) return false
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customer.includes(search) && !o.product.includes(search)) return false
    return true
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const handleExport = (fmt) => {
    if (filtered.length === 0) { showToast('没有可导出的订单', 'warning'); return }
    const rows = filtered.map(o => ({
      订单号: o.id, 客户: o.customer, 商品: o.product, 件数: o.items,
      金额: o.total + ' ' + (o.currency || '₽'),
      状态: (statusMap[o.status] && statusMap[o.status].label) || o.status,
      仓库配送: o.warehouse || o.deliveryMethod || '—',
      物流单号: o.tracking, 备注: o.note || '',
      下单时间: o.date,
    }))
    const name = `orders_export_${new Date().toISOString().slice(0, 10)}`
    if (fmt === 'excel') exportToExcel(rows, name + '.xls')
    else exportToCSV(rows, name + '.csv')
    showToast(`已导出 ${rows.length} 条订单（${fmt === 'excel' ? 'Excel' : 'CSV'}）`, 'success')
  }

  const statusBadge = (o) => (
    <span
      title={o.ozonStatus ? `原始状态: ${o.ozonStatus}` : ''}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-default ${statusMap[o.status]?.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusMap[o.status]?.dot}`} />
      {statusMap[o.status]?.label}
    </span>
  )

  const tabList = [
    { key: 'all',       label: '全部' },
    { key: 'pending',   label: '等待备货' },
    { key: 'processing',label: '等待发货' },
    { key: 'shipped',  label: '运输中' },
    { key: 'delivered',label: '已签收' },
    { key: 'disputed', label: '有争议' },
    { key: 'cancelled',label: '已取消' },
  ]

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      {/* 工具栏：状态Tab + 操作按钮 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
        {/* 7状态Tab */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabList.map(t => (
            <button
              key={t.key}
              onClick={() => { setFilter(t.key); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === t.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[t.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* 搜索 + 拉取 + 导出 */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="搜索订单号/客户/商品..."
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="refresh" size={13} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? '拉取中...' : '拉取新订单'}
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <Icon name="download" size={13} /> 导出CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <Icon name="fileText" size={13} /> 导出Excel
            </button>
          </div>
        </div>
      </div>

      {/* 订单表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <div className="text-sm font-medium">{filter === 'all' ? '暂无订单' : `暂无「${tabList.find(t => t.key === filter)?.label}」订单`}</div>
            <div className="text-xs mt-1">点击右上角「拉取新订单」获取最新数据</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">订单号</th>
                <th className="text-left px-4 py-3 font-medium">件数</th>
                <th className="text-left px-4 py-3 font-medium">商品</th>
                <th className="text-left px-4 py-3 font-medium">金额</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">仓库/配送</th>
                <th className="text-left px-4 py-3 font-medium">下单时间</th>
                <th className="text-left px-4 py-3 font-medium">物流单号</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-blue-600 text-xs">{o.id}</div>
                    {o.note && <div className="text-[10px] text-orange-500 mt-0.5 truncate max-w-[120px]">{o.note}</div>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5 text-xs font-bold">{o.items}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">
                    <div className="truncate" title={o.product}>{o.product}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-800">
                      {o.currency === 'CNY' ? '¥' : '₽'}{parseFloat(o.total).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(o)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.warehouse || o.deliveryMethod || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.tracking !== '—' ? o.tracking : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 分页 */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-400">
              显示 {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} 条，共 {filtered.length} 条
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-xs border rounded ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== 商品管理页面 ====================
const Products = ({ products, setProducts }) => {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('sold')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索商品..."
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none">
            <option value="sold">按销量排序</option>
            <option value="stock">按库存排序</option>
            <option value="rating">按评分排序</option>
            <option value="price">按价格排序</option>
          </select>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
          <Icon name="plus" size={13} /> 添加商品
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                {p.image && p.image.startsWith('http') ? (
                  <img src={p.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{p.image || '📦'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                    <div className="text-[11px] text-gray-400">{p.sku}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'active' ? '在售' : '下架'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-blue-600">₽{p.price.toLocaleString()}</span>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span>📦 {p.stock}</span>
                    <span>💰 {p.sold}</span>
                    <span>⭐ {p.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 库存管理页面 ====================
const Inventory = ({ products, setProducts }) => {
  const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0)

  return (
    <div className="p-6 space-y-4 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="package" label="商品种类" value={products.length} color="blue" />
        <StatCard icon="inventory" label="库存总量" value={products.reduce((s, p) => s + p.stock, 0).toLocaleString()} color="purple" />
        <StatCard icon="warning" label="低库存预警" value={products.filter(p => p.stock < 30).length} color="yellow" />
        <StatCard icon="money" label="库存价值" value={`₽${totalValue.toLocaleString()}`} color="green" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="text-left px-4 py-3">商品</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">库存</th>
              <th className="text-left px-4 py-3">成本价</th>
              <th className="text-left px-4 py-3">库存价值</th>
              <th className="text-left px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center text-lg overflow-hidden">
                    {p.image && p.image.startsWith('http') ? (
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.image || '📦'}</span>
                    )}
                  </span>
                  <span>{p.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${p.stock < 15 ? 'text-red-600' : p.stock < 30 ? 'text-yellow-600' : 'text-gray-800'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">₽{p.cost.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">₽{(p.stock * p.cost).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {p.stock < 15 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700">紧急</span>
                  ) : p.stock < 30 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-100 text-yellow-700">预警</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700">正常</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== 系统设置页面 ====================
const Settings = ({ apiConfig, setApiConfig, autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval }) => {
  const [testing, setTesting] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const saveConfig = () => {
    setApiConfig({ clientId: (apiConfig.clientId || '').trim(), apiKey: (apiConfig.apiKey || '').trim() })
    showToast('设置已保存', 'success')
  }

  const handleTest = async () => {
    const clientId = (apiConfig.clientId || '').trim()
    const apiKey = (apiConfig.apiKey || '').trim()
    if (!clientId || !apiKey) {
      showToast('请先填写 Client-Id 和 Api-Key', 'error')
      return
    }
    // 格式校验
    if (!/^\d+$/.test(clientId)) {
      showToast('Client-Id 应为纯数字（如 123456）', 'error')
      return
    }
    if (apiKey.length < 20) {
      showToast('Api-Key 格式异常（通常 40+ 字符）', 'error')
      return
    }
    // 先保存再测试（确保 localStorage 里的值是干净的）
    const cleanConfig = { clientId, apiKey }
    setApiConfig(cleanConfig)
    localStorage.setItem('ozonApiConfig', JSON.stringify(cleanConfig))
    setTesting(true)
    try {
      const res = await testConnection()
      const roleCount = res?.roles?.length || 0
      showToast(`✅ 连接成功！密钥包含 ${roleCount} 个角色`, 'success')
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('401') || msg.includes('403')) {
        showToast('❌ 密钥无效（权限不足），请确认 Client-Id 和 Api-Key 匹配', 'error')
      } else if (msg.includes('404')) {
        showToast('❌ 密钥无效，请到 seller.ozon.ru 重新生成 Seller API 密钥', 'error')
      } else {
        showToast('❌ 连接失败：' + msg.slice(0, 100), 'error')
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-slide-up max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800">系统设置</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Ozon API 密钥</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            真实API模式
          </span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Client-Id</label>
          <input value={apiConfig.clientId || ''} onChange={e => setApiConfig(prev => ({ ...prev, clientId: e.target.value }))}
            placeholder="如 123456" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Api-Key <button onClick={() => setShowKey(!showKey)} className="text-blue-500 hover:underline">{showKey ? '隐藏' : '显示'}</button></label>
          <input type={showKey ? 'text' : 'password'} value={apiConfig.apiKey || ''} onChange={e => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="粘贴 Ozon Seller API 密钥" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
          <p className="text-xs text-gray-400 mt-1">长度: {(apiConfig.apiKey || '').length} 字符 {((apiConfig.apiKey || '').length > 0 && (apiConfig.apiKey || '').length < 30) ? '⚠️ 密钥过短' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={saveConfig} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存配置</button>
          <button onClick={handleTest} disabled={testing}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            {testing ? '测试中...' : '测试连接'}
          </button>
        </div>
        <p className="text-xs text-gray-400">密钥仅保存在本地浏览器（localStorage），不会上传到任何服务器。</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">自动刷新</h3>
        <div className="flex items-center gap-4">
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-gray-600">{autoRefresh ? '已开启' : '已关闭'}</span>
        </div>
        {autoRefresh && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: 30000, label: '30秒' },
              { value: 60000, label: '1分钟' },
              { value: 120000, label: '2分钟' },
              { value: 300000, label: '5分钟' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setRefreshInterval(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${refreshInterval === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">切到其他标签页时自动暂停，回来继续。</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="user" size={28} className="text-blue-600" />
          <div>
            <div className="font-medium text-gray-800">19396067405</div>
            <div className="text-xs text-gray-500">当前登录账号</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-yellow-600 font-bold">
          <span>🪙</span><span>8000</span><span className="text-xs text-gray-400 font-normal">积分</span>
        </div>
      </div>
    </div>
  )
}

// ==================== 主应用 ====================
// ==================== 选品分析页面（what_to_sell） ====================
const ProductResearch = ({ categories }) => {
  const [keyword, setKeyword] = useState('')
  const [catId, setCatId] = useState('')
  const [commission, setCommission] = useState(null)
  const [loading, setLoading] = useState(false)

  // 选品建议（演示数据；绑定 Ozon API 后可由销售分析/类目佣金接口增强）
  const suggestions = [
    { category: '手机配件', gmv: '₽1.2M', competition: '中', trend: '↑ 23%', commission: '12%', score: 92 },
    { category: '家居收纳', gmv: '₽860K', competition: '低', trend: '↑ 41%', commission: '10%', score: 88 },
    { category: '宠物用品', gmv: '₽740K', competition: '中', trend: '↑ 18%', commission: '14%', score: 85 },
    { category: '美妆工具', gmv: '₽620K', competition: '高', trend: '↑ 9%', commission: '15%', score: 76 },
    { category: '户外照明', gmv: '₽530K', competition: '低', trend: '↑ 33%', commission: '11%', score: 83 },
    { category: '汽车电子', gmv: '₽910K', competition: '中', trend: '↑ 27%', commission: '13%', score: 90 },
  ]
  const filtered = suggestions.filter(s => s.category.includes(keyword.trim()))

  const queryCommission = async () => {
    const id = catId.trim()
    if (!id) { showToast('请输入类目 ID', 'warning'); return }
    // 始终为真实 API 模式
    setLoading(true)
    try {
      // 优先用本地类目树（已缓存），否则调 API
      if (categories?.length) {
        const cat = categories.find(c => String(c.id) === id || String(c.category_id) === id)
        setCommission(cat?.commission_percent || cat?.commission || null)
        showToast('已从缓存类目树获取佣金', 'success')
      } else {
        const r = await getCommissions(Number(id))
        const rate = r && (r.commission_percent ?? r.commission ?? (r.result && (r.result.commission_percent || r.result.commission)))
        setCommission(rate)
        showToast('已获取类目佣金', 'success')
      }
    } catch (e) {
      showToast('佣金查询失败：' + e.message, 'error')
    } finally { setLoading(false) }
  }

  const scoreColor = (s) => s >= 88 ? 'bg-green-500' : s >= 80 ? 'bg-blue-500' : 'bg-yellow-500'

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">选品分析</h3>
        <p className="text-sm text-gray-500 mt-1">参考毛子ERP「what_to_sell」思路：基于类目 GMV、竞争度、佣金与趋势给出选品建议。</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" size={16} /></span>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="搜索类目关键词…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.category} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">{s.category}</h4>
              <span className="text-xs font-semibold text-white bg-blue-500 rounded-full px-2 py-0.5">得分 {s.score}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><span>预估月 GMV</span><span className="font-medium text-gray-800">{s.gmv}</span></div>
              <div className="flex justify-between"><span>竞争度</span><span>{s.competition}</span></div>
              <div className="flex justify-between"><span>趋势</span><span className="text-green-600">{s.trend}</span></div>
              <div className="flex justify-between"><span>类目佣金</span><span>{s.commission}</span></div>
            </div>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${scoreColor(s.score)}`} style={{ width: `${s.score}%` }} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">未找到匹配的选品建议</div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-3">类目佣金查询（真实 API）</h4>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Ozon 类目 ID</label>
            <input
              value={catId}
              onChange={e => setCatId(e.target.value)}
              placeholder="例如 17029891"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={queryCommission}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '查询中…' : '查询佣金'}
          </button>
          {commission != null && (
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
              该类目佣金率：<b>{commission}%</b>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 变体 / 套餐页面（variant & bundle） ====================
const VariantBundle = () => {
  const [tab, setTab] = useState('variant')
  const [bundles, setBundles] = useState(() => [
    { id: 'B1', name: '手机+壳+膜 超值套餐', items: ['智能手机 X1', '硅胶保护壳', '钢化膜'], price: 1290 },
    { id: 'B2', name: '耳机+收纳包 套装', items: ['无线蓝牙耳机', '便携收纳包'], price: 459 },
  ])
  const variants = [
    { id: 'V1', name: '无线蓝牙耳机', options: ['黑色', '白色', '蓝色'], sku: 'EARBUD-001' },
    { id: 'V2', name: '纯棉圆领T恤', options: ['S', 'M', 'L', 'XL'], sku: 'TEE-002' },
    { id: 'V3', name: '保温水杯', options: ['350ml', '500ml', '750ml'], sku: 'CUP-003' },
  ]
  const [newName, setNewName] = useState('')
  const [picked, setPicked] = useState([])

  const togglePick = (n) => setPicked(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const createBundle = () => {
    if (!newName.trim() || picked.length < 2) { showToast('请填写套餐名并至少选择 2 个商品', 'warning'); return }
    setBundles(prev => [...prev, { id: 'B' + Date.now(), name: newName.trim(), items: [...picked], price: 0 }])
    showToast('套餐已创建', 'success'); setNewName(''); setPicked([])
  }

  return (
    <div className="p-6 space-y-5 animate-slide-up">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">变体 / 套餐</h3>
        <p className="text-sm text-gray-500 mt-1">参考毛子ERP 变体搜索(search-variant-model) 与 搭配套餐(create-bundle)。Ozon 变体/套餐依赖内部接口，当前为演示形态。</p>
      </div>

      <div className="flex gap-2">
        {[{ k: 'variant', t: '商品变体' }, { k: 'bundle', t: '搭配套餐' }].map(x => (
          <button key={x.k} onClick={() => setTab(x.k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === x.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {x.t}
          </button>
        ))}
      </div>

      {tab === 'variant' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variants.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">{v.name}</h4>
                <span className="text-xs text-gray-400">{v.sku}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {v.options.map(o => (
                  <span key={o} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{o}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <h4 className="font-medium text-gray-800">新建套餐</h4>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="套餐名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex flex-wrap gap-2">
              {variants.map(v => (
                <button key={v.id} onClick={() => togglePick(v.name)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${picked.includes(v.name) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {v.name}
                </button>
              ))}
            </div>
            <button onClick={createBundle} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">创建套餐</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundles.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{b.name}</h4>
                  <Icon name="bundle" size={18} className="text-gray-400" />
                </div>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {b.items.map((it, i) => <li key={i}>· {it}</li>)}
                </ul>
                <div className="mt-2 text-sm text-gray-500">{b.price ? `套餐价 ₽${b.price}` : '价格待定'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== 物流查询页面 ====================
const Logistics = ({ orders = [] }) => {
  const [trackNo, setTrackNo] = useState('')
  const [result, setResult] = useState(null)
  const shipments = orders.filter(o => o.tracking && o.tracking !== '—')
  const statusLabel = (s) => ({ pending: '待发货', processing: '处理中', shipped: '运输中', delivered: '已签收', cancelled: '已取消' }[s] || s)
  const statusColor = (s) => ({ pending: 'bg-gray-100 text-gray-600', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600')

  const handleTrack = () => {
    if (!trackNo.trim()) { showToast('请输入运单号或订单号', 'warning'); return }
    const m = shipments.find(o => o.tracking === trackNo.trim() || o.id === trackNo.trim())
    const st = m ? m.status : (['shipped', 'processing', 'delivered'][Math.floor(Math.random() * 3)])
    setResult({ no: m ? m.tracking : trackNo.trim(), status: st, customer: m ? m.customer : '—' })
    showToast('物流查询完成', 'success')
  }

  const allSteps = ['已下单', '已揽收', '运输中', '到达分拨中心', '派送中', '已签收']
  const idxOf = { pending: 0, processing: 1, shipped: 3, delivered: 5, cancelled: -1 }

  return (
    <div className="p-6 space-y-5 animate-slide-up">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">物流查询</h3>
        <p className="text-sm text-gray-500 mt-1">参考布丁猫插件「物流查询」。可输入运单号/订单号查询；绑定 Ozon API 后按真实订单物流状态展示。</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex gap-3">
          <input value={trackNo} onChange={e => setTrackNo(e.target.value)} placeholder="输入运单号或订单号…"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleTrack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">查询</button>
        </div>

        {result && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">运单号 {result.no}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(result.status)}`}>{statusLabel(result.status)}</span>
            </div>
            <div className="space-y-3">
              {allSteps.map((s, i) => {
                const done = i <= (idxOf[result.status] ?? 1)
                const isCancel = result.status === 'cancelled'
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${done && !isCancel ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm ${done && !isCancel ? 'text-gray-800' : 'text-gray-400'}`}>{s}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-3">近期运单（来自订单）</h4>
        {shipments.length === 0 ? (
          <div className="text-center text-gray-400 py-6">暂无运单（演示订单未含运单号，绑定 API 后显示真实物流）</div>
        ) : (
          <div className="space-y-2">
            {shipments.slice(0, 8).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm text-gray-800">{o.id}</div>
                  <div className="text-xs text-gray-400">{o.tracking} · {o.customer}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== 店铺管理页面 ====================
const ShopManage = ({ sellerInfo, warehouses }) => {
  if (!sellerInfo) {
    return (
      <div className="p-6 space-y-6 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-800">店铺管理</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          ⚠️ 请先在「系统设置」切换到真实 API 模式以查看店铺数据
        </div>
      </div>
    )
  }
  const ratings = sellerInfo.ratings || []
  const shipDelay = ratings.find(r => r.type?.includes('delay'))
  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-gray-800">店铺管理</h2>
      {/* 店铺信息卡 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">🏪</div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">{sellerInfo.name}</h3>
              {sellerInfo.premium && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">★ Premium</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
              <div><span className="text-gray-400">公司名称：</span>{sellerInfo.legalName}</div>
              <div><span className="text-gray-400">INN：</span>{sellerInfo.inn}</div>
              <div><span className="text-gray-400">币种：</span>{sellerInfo.currency}</div>
              <div><span className="text-gray-400">国家：</span>{sellerInfo.country}</div>
              {sellerInfo.reviewScore && <div><span className="text-gray-400">店铺评分：</span>{sellerInfo.reviewScore} ⭐</div>}
              {shipDelay && <div><span className="text-gray-400">配送延迟率：</span>{shipDelay.formatted}</div>}
            </div>
          </div>
        </div>
      </div>
      {/* 仓库列表 */}
      {warehouses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">仓库列表（{warehouses.length} 个）</h3>
          <div className="space-y-3">
            {warehouses.map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{w.is_rfbs ? '📦' : '🏭'}</span>
                  <div>
                    <div className="font-medium text-gray-800">{w.name}</div>
                    <div className="text-xs text-gray-500">{w.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {w.status === 'active' ? '启用' : '停用'}
                  </span>
                  <span className="text-xs text-gray-400">{w.warehouse_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== 数据分析页面 ====================
const AnalyticsPage = ({ analytics, orders }) => {
  const [tab, setTab] = useState('overview')
  if (!analytics) {
    return (
      <div className="p-6 space-y-6 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-800">数据分析</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          ⚠️ 请先在「系统设置」切换到真实 API 模式以查看销售分析数据
        </div>
        {/* 演示数据 */}
        <div className="grid grid-cols-3 gap-4">
          {[['总收入', '¥1,256,800', 'bg-green-50', 'text-green-700'],
            ['总订单', '3,842 单', 'bg-blue-50', 'text-blue-700'],
            ['平均客单价', '¥327', 'bg-purple-50', 'text-purple-700']].map(([l, v, bg, tc]) => (
            <div key={l} className={`rounded-lg p-4 ${bg}`}>
              <div className={`text-sm font-medium ${tc}`}>{l}</div>
              <div className={`text-2xl font-bold mt-1 ${tc}`}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  const rows = analytics.rows || []
  const totalRev = analytics.totalRevenue || 0
  const totalOrders = rows.length
  const avgOrderValue = totalOrders > 0 ? totalRev / totalOrders : 0
  const currency = orders[0]?.currency || 'CNY'
  const fmt = (n) => currency === 'CNY' ? `¥${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `₽${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-gray-800">数据分析</h2>
      {/* 核心指标 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-700">30天总收入</div>
          <div className="text-2xl font-bold mt-1 text-green-700">{fmt(totalRev)}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-700">有销售SKU数</div>
          <div className="text-2xl font-bold mt-1 text-blue-700">{totalOrders}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-700">平均客单价</div>
          <div className="text-2xl font-bold mt-1 text-purple-700">{fmt(avgOrderValue)}</div>
        </div>
      </div>
      {/* Tab 切换 */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['overview', '按SKU明细'], ['top', 'TOP销售']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === k ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>
      {/* 明细表 */}
      {tab === 'overview' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">SKU</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">销售额</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">订单数</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">销量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.slice(0, 50).map((row, i) => {
                const [sku, ...rest] = row.dimensions || []
                const [revenue, ordQty, units, returns] = row.metrics || []
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{sku || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{fmt(Number(revenue) || 0)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(ordQty) || 0}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(units) || 0}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无销售数据</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {/* TOP 销售 */}
      {tab === 'top' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">排名</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">SKU</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">销售额</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">销量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.slice(0, 20).sort((a, b) => (Number(b.metrics?.[0]) || 0) - (Number(a.metrics?.[0]) || 0)).map((row, i) => {
                const [sku] = row.dimensions || []
                const [revenue,, units] = row.metrics || []
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center w-12">{medals[i] || `#${i + 1}`}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{sku}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{fmt(Number(revenue) || 0)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(units) || 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [apiConfig, setApiConfig] = useLocalStorage('ozonApiConfig', { clientId: '', apiKey: '' })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [sellerInfo, setSellerInfo] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [categories, setCategories] = useState([])
  const [crawlHistory, setCrawlHistory] = useState([])
  const [promotions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [reviews, setReviews] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  // 自动刷新设置
  const [autoRefresh, setAutoRefresh] = useLocalStorage('qxerp.autoRefresh', true)
  const [refreshInterval, setRefreshInterval] = useLocalStorage('qxerp.refreshInterval', 60000)
  const [countdown, setCountdown] = useState(0)
  const tabVisibleRef = useRef(true)
  const refreshFnRef = useRef()

  // 页面可见性切换：切到后台暂停刷新
  useEffect(() => {
    const handler = () => { tabVisibleRef.current = !document.hidden }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // 自动刷新计时器
  useEffect(() => {
    setCountdown(autoRefresh ? Math.floor(refreshInterval / 1000) : 0)
    if (!autoRefresh || !apiConfig.clientId) return

    const tick = () => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (tabVisibleRef.current) refreshFnRef.current()
          return Math.floor(refreshInterval / 1000)
        }
        return prev - 1
      })
    }

    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, apiConfig.clientId])

  const refresh = useCallback(() => {
    if (!apiConfig.clientId || !apiConfig.apiKey) {
      showToast('请先在「系统设置」配置 API 密钥', 'warning')
      return
    }
    setLoading(true)
    setLastRefreshTime(Date.now())
    loadRealData().then(data => {
      let count = 0
      if (data.sellerInfo) { setSellerInfo(data.sellerInfo); count++ }
      if (data.analytics) { setAnalytics(data.analytics); count++ }
      if (data.categories?.length) { setCategories(data.categories); count++ }
      if (data.orders?.length) { setOrders(data.orders); count += data.orders.length }
      if (data.products?.length) { setProducts(data.products); count += data.products.length }
      if (data.warehouses?.length) { setWarehouses(data.warehouses); count += data.warehouses.length }
      if (data.reviews?.length) { setReviews(data.reviews); count += data.reviews.length }
      if (data.transactions?.length) { setTransactions(data.transactions); count += data.transactions.length }
      const shopName = data.sellerInfo?.name || 'Ozon 店铺'
      showToast(count ? `已加载真实数据（${count} 条）店铺: ${shopName}` : 'Ozon 返回为空', count ? 'success' : 'warning')
    }).catch(e => {
      showToast('真实数据加载失败：' + e.message, 'error')
    }).finally(() => setLoading(false))
  }, [apiConfig])

  // 保持 refresh 引用最新（必须在 refresh 定义之后）
  useEffect(() => { refreshFnRef.current = refresh }, [refresh])

  useEffect(() => {
    if (apiConfig.clientId && apiConfig.apiKey) {
      refresh()
    }
  }, [])

  const pages = {
    dashboard: <Dashboard orders={orders} products={products} sellerInfo={sellerInfo} analytics={analytics} />,
    shop: <ShopManage sellerInfo={sellerInfo} warehouses={warehouses} />,
    uploadFast: <UploadFast products={products} setProducts={setProducts} />,
    crawl: <Crawl setProducts={setProducts} setCrawlHistory={setCrawlHistory} />,
    crawlHistory: <CrawlHistory history={crawlHistory} />,
    products: <Products products={products} setProducts={setProducts} />,
    relist: <Relist products={products} setProducts={setProducts} />,
    inventory: <Inventory products={products} setProducts={setProducts} />,
    warehouse: <Warehouse warehouses={warehouses} />,
    orders: <Orders orders={orders} setOrders={setOrders} onRefresh={refresh} isLoading={loading} />,
    logistics: <Logistics orders={orders} />,
    notifications: <Notifications notifications={[...reviews, ...notifications]} />,
    promotions: <Promotions promotions={promotions} />,
    analytics: <AnalyticsPage analytics={analytics} orders={orders} />,
    research: <ProductResearch categories={categories} />,
    variant: <VariantBundle />,
    settings: <Settings apiConfig={apiConfig} setApiConfig={setApiConfig} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} refreshInterval={refreshInterval} setRefreshInterval={setRefreshInterval} />,
  }

  return (
    <LoginGate>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
        <TopToolbar onRefresh={refresh} loading={loading} sellerInfo={sellerInfo} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} countdown={countdown} lastRefreshTime={lastRefreshTime} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar active={active} setActive={setActive} />
          <main className="flex-1 overflow-y-auto animate-fadeIn">
            {pages[active] || pages.dashboard}
          </main>
        </div>
        <ToastHost />
      </div>
    </LoginGate>
  )
}
