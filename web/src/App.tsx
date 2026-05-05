import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Workflow, 
  Store, 
  Plus, 
  Settings as SettingsIcon, 
  User,
  ChevronRight,
  Home,
  Zap,
  Database,
  Server,
  FileText,
  BarChart3
} from 'lucide-react'
import { useAppStore } from './store'
import { cn } from './utils/helpers'
import { FlowList } from './pages/FlowList'
import { FlowDetail } from './pages/FlowDetail'
import Dashboard from './pages/Dashboard'
import { SkillMarket } from './pages/SkillMarket'
import { MCPMarket } from './pages/MCPMarket'
import { MCPCreate } from './pages/MCPCreate'
import { Executions } from './pages/Executions'
import { Settings } from './pages/Settings'

// 侧边栏导航配置
const sidebarItems = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'flows',
    label: 'Flows',
    icon: Workflow,
    children: [
      { id: 'flow-create', label: 'Flow 创建', icon: Plus, path: '/flows/create' },
      { id: 'flow-list', label: 'Flow 列表', icon: FileText, path: '/flows/list' },
      { id: 'flow-market', label: 'Flow Market', icon: Store, path: '/flows/market' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Zap,
    children: [
      { id: 'skill-create', label: 'Skill 创建', icon: Plus, path: '/skills/create' },
      { id: 'skill-market', label: 'Skill Market', icon: Store, path: '/skills/market' },
    ],
  },
  {
    id: 'models',
    label: '模型',
    icon: Database,
    children: [
      { id: 'model-register', label: '模型注册', icon: Plus, path: '/models/register' },
      { id: 'model-market', label: '模型 Market', icon: Store, path: '/models/market' },
    ],
  },
  {
    id: 'mcp',
    label: 'MCP Servers',
    icon: Server,
    children: [
      { id: 'mcp-register', label: 'MCP 注册', icon: Plus, path: '/mcp/register' },
      { id: 'mcp-market', label: 'MCP Market', icon: Store, path: '/mcp/market' },
    ],
  },
  {
    id: 'executions',
    label: '执行监控',
    icon: BarChart3,
    path: '/executions',
  },
  {
    id: 'settings',
    label: '设置',
    icon: SettingsIcon,
    path: '/settings',
  },
]

// 侧边栏组件
function Sidebar() {
  const { sidebarExpanded, toggleSidebar, activeModule } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarExpanded ? 280 : 80,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="h-full glass-dark border-r border-white/10 flex flex-col"
    >
      {/* Logo 区域 */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold text-white">AgentFlow</h1>
                <p className="text-xs text-white/60">AI Workflow Builder</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleSidebar()}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                    'text-white/70 hover:text-white hover:bg-white/10',
                    'transition-all duration-200'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarExpanded && (
                    <ChevronRight className="w-4 h-4 ml-auto text-white/40" />
                  )}
                </button>
                {sidebarExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 mt-1 space-y-1"
                  >
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.path)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm',
                          'transition-all duration-200',
                          location.pathname === child.path
                            ? 'bg-gradient-primary text-white shadow-glow'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (item.path) {
                    useAppStore.getState().setActiveModule(item.id)
                    navigate(item.path)
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'text-white/70 hover:text-white hover:bg-white/10',
                  'transition-all duration-200',
                  (activeModule === item.id || location.pathname === item.path) && 'bg-gradient-primary text-white shadow-glow'
                )}
              >
                <item.icon className="w-5 h-5" />
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* 用户信息 */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200">
          <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 text-left"
              >
                <p className="text-sm font-medium text-white">Demo User</p>
                <p className="text-xs text-white/60">Pro Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

// 主内容区域组件
function MainContent() {
  return (
    <main className="flex-1 overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flows/*" element={<FlowModule />} />
        <Route path="/skills/*" element={<SkillModule />} />
        <Route path="/models/*" element={<ModelModule />} />
        <Route path="/mcp/*" element={<MCPModule />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </main>
  )
}


// Flow 模块组件
function FlowModule() {
  return (
    <Routes>
      <Route index element={<FlowList />} />
      <Route path="list" element={<FlowList />} />
      <Route path=":id" element={<FlowDetail />} />
      <Route path="create" element={<FlowDetail />} />
      <Route path="market" element={<div className="h-full p-8 overflow-y-auto"><h1 className="text-3xl font-bold text-white mb-8">Flow Market</h1><div className="glass-effect rounded-2xl p-6"><p className="text-white/60">Flow Market 功能开发中...</p></div></div>} />
    </Routes>
  )
}

function SkillModule() {
  return (
    <Routes>
      <Route path="market" element={<SkillMarket />} />
      <Route path="create" element={<div className="h-full p-8"><h1 className="text-3xl font-bold text-white">创建 Skill</h1></div>} />
      <Route path="*" element={<Navigate to="/skills/market" replace />} />
    </Routes>
  )
}

function ModelModule() {
  return (
    <div className="h-full p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-8">模型管理</h1>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-white/60">模型注册和市场功能开发中...</p>
      </div>
    </div>
  )
}

function ExecutionsPage() {
  return (
    <div className="h-full p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-8">执行监控</h1>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-white/60">执行监控功能开发中...</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="h-full p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-8">设置</h1>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-white/60">设置功能开发中...</p>
      </div>
    </div>
  )
}

function MCPModule() {
  return (
    <Routes>
      <Route path="market" element={<MCPMarket />} />
      <Route path="register" element={<MCPCreate />} />
      <Route path="*" element={<Navigate to="/mcp/market" replace />} />
    </Routes>
  )
}



// 主应用组件
function App() {
  return (
    <div className="h-screen w-full flex">
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}