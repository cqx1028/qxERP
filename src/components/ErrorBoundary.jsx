import React from 'react';

/**
 * 全局错误边界：防止某个组件抛错导致整页空白
 *
 * 用法：包裹 <App /> 即可
 * 出现错误时显示降级 UI（带重载按钮），而不是一片白屏
 *
 * 改进：暴露 componentStack，方便定位错误源
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null, info: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const errMsg =
      (this.state.error && (this.state.error.message || String(this.state.error))) ||
      '未知错误';

    // 提取 componentStack（从 React 错误堆栈里找出 App.jsx 的具体行号）
    let stackLines = [];
    if (this.state.info && this.state.info.componentStack) {
      stackLines = this.state.info.componentStack
        .split('\n')
        .filter((l) => l.trim())
        .slice(0, 12);
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl text-3xl mb-3">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-gray-900">页面出错了</h1>
            <p className="text-sm text-gray-500 mt-2">
              某个组件发生了异常，已被错误边界拦截。请尝试刷新或重置。
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            <div className="font-mono text-red-800 break-all">{errMsg}</div>
          </div>

          {stackLines.length > 0 && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-xs">
              <summary className="cursor-pointer font-medium text-gray-700">
                📍 组件堆栈（点开查看定位）
              </summary>
              <pre className="mt-2 font-mono text-gray-600 whitespace-pre-wrap break-all">
                {stackLines.join('\n')}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition"
            >
              刷新页面
            </button>
            <button
              onClick={this.handleReset}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              清缓存重置
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
            如果问题反复出现，请打开浏览器开发者工具 (F12) 查看详细错误
          </div>
        </div>
      </div>
    );
  }
}