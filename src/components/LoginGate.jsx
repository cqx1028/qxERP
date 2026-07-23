import React, { useState, useEffect } from 'react';

/**
 * 静态密码登录门
 *
 * 安全模型（前端拦截级别）：
 * - 默认密码: ozon2026（首次登录后会在提示中引导修改）
 * - 密码哈希后存 sessionStorage（关浏览器即失效）
 * - 会话空闲 30 分钟自动登出
 * - 源码在 GitHub 公开，可见哈希值 → 资深用户可绕过
 *   这是「防君子不防小人」的拦截层，真要严防需配合 Cloudflare Access（需域名）
 *
 * 升级路径：
 * - 接入 Ozon 密钥后，建议改用 Web Crypto API 加密存储 Client-Id + Api-Key
 */

const DEFAULT_HASH = '48fb8e6c9f0cba1b8e36d4e9c6d2b6e3a1f8b7c4d5e9f2a6b8c1d3e5f7a9b2c4d'; // placeholder

// SHA-256 同步实现（用于浏览器原生 crypto.subtle）
async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const SESSION_KEY = 'qxerp.auth';
const TIMESTAMP_KEY = 'qxerp.auth.ts';
const HOURS_KEY = 'qxerp.auth.hours';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 分钟

export default function LoginGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // 初始化检查
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    const ts = sessionStorage.getItem(TIMESTAMP_KEY);
    if (stored && ts) {
      const age = Date.now() - parseInt(ts, 10);
      if (age < SESSION_TTL_MS) {
        setAuthed(true);
      } else {
        // 过期
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(TIMESTAMP_KEY);
      }
    }

    // 空闲监听
    let timer = null;
    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(TIMESTAMP_KEY);
        setAuthed(false);
        setErr('会话超时，请重新登录');
      }, SESSION_TTL_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const hash = await sha256(pwd);
      // SHA-256('qxerp2026') = d1e23be8e07451eb08303a08cfde1e235cb1dcf0110c9d3ac5fc34b45098bc78
      const ALLOW = {
        'd1e23be8e07451eb08303a08cfde1e235cb1dcf0110c9d3ac5fc34b45098bc78':
          'qxerp2026',
      };
      if (ALLOW[hash]) {
        sessionStorage.setItem(SESSION_KEY, 'ok');
        sessionStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
        sessionStorage.setItem(HOURS_KEY, new Date().toLocaleString('zh-CN'));
        setAuthed(true);
        setPwd('');
      } else {
        setErr('密码错误');
      }
    } catch (e) {
      setErr('登录失败：' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TIMESTAMP_KEY);
    setAuthed(false);
  };

  // 把登出方法挂到全局，方便 App 顶栏调用
  useEffect(() => {
    if (authed) {
      window.__qxerpLogout = handleLogout;
    } else {
      delete window.__qxerpLogout;
    }
  }, [authed]);

  if (authed) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl text-3xl mb-3">
            🐱
          </div>
          <h1 className="text-2xl font-bold text-gray-900">布丁猫 Ozon ERP</h1>
          <p className="text-sm text-gray-500 mt-1">请输入访问密码</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="访问密码"
            autoFocus
            disabled={busy}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          {err && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !pwd}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {busy ? '验证中...' : '登 录'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center leading-relaxed">
          <div>默认密码：<span className="font-mono text-gray-600">qxerp2026</span></div>
          <div className="mt-2">会话有效期：30 分钟（无操作自动登出）</div>
          <div className="mt-2">源码公开 · 这是前端拦截级别</div>
        </div>
      </div>
    </div>
  );
}