/**
 * 主布局组件
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { useFlowEditorStore } from '@/hooks/useFlowEditor'
import { cn } from '@/utils'

export function MainLayout() {
  const location = useLocation()
  const { currentFlow, hasUnsavedChanges } = useFlowEditorStore()

  const navItems = [
    { path: '/', label: 'Flow Editor', icon: '📊' },
    { path: '/monitor', label: 'Monitor', icon: '📈' },
    { path: '/flows', label: 'Flows', icon: '📁' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold hover:text-gray-300 transition-colors">
            <span className="text-2xl">🤖</span>
            <span>AgentFlow</span>
          </Link>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 未保存的更改指示器 */}
        {hasUnsavedChanges && (
          <div className="p-4 border-t border-gray-700">
            <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">
              ⚠️ Unsaved changes
            </div>
          </div>
        )}

        {/* Flow 信息 */}
        {currentFlow && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              <div className="mb-2">Current Flow</div>
              <div className="font-semibold text-white">
                {currentFlow.metadata.name}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                v{currentFlow.metadata.version}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}