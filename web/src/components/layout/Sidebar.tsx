import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  SparklesIcon,
  CubeIcon,
  BeakerIcon,
  CpuChipIcon,
  ServerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '../../store'
import { cn } from '../../utils/helpers'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className="w-5 h-5" />,
    path: '/',
  },
  {
    id: 'flows',
    label: 'Workflows',
    icon: <SparklesIcon className="w-5 h-5" />,
    children: [
      { id: 'flow-create', label: 'Create Flow', icon: <PlusIcon className="w-4 h-4" />, path: '/flows/create' },
      { id: 'flow-market', label: 'Flow Market', icon: <CubeIcon className="w-4 h-4" />, path: '/flows/market' },
      { id: 'flow-list', label: 'My Flows', icon: <ChartBarIcon className="w-4 h-4" />, path: '/flows' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: <BeakerIcon className="w-5 h-5" />,
    children: [
      { id: 'skill-create', label: 'Create Skill', icon: <PlusIcon className="w-4 h-4" />, path: '/skills/create' },
      { id: 'skill-market', label: 'Skill Market', icon: <CubeIcon className="w-4 h-4" />, path: '/skills/market' },
    ],
  },
  {
    id: 'models',
    label: 'Models',
    icon: <CpuChipIcon className="w-5 h-5" />,
    children: [
      { id: 'model-register', label: 'Register Model', icon: <PlusIcon className="w-4 h-4" />, path: '/models/register' },
      { id: 'model-market', label: 'Model Market', icon: <CubeIcon className="w-4 h-4" />, path: '/models/market' },
    ],
  },
  {
    id: 'mcp-servers',
    label: 'MCP Servers',
    icon: <ServerIcon className="w-5 h-5" />,
    children: [
      { id: 'mcp-register', label: 'Register Server', icon: <PlusIcon className="w-4 h-4" />, path: '/mcp-servers/register' },
      { id: 'mcp-market', label: 'MCP Market', icon: <CubeIcon className="w-4 h-4" />, path: '/mcp-servers/market' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    path: '/settings',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon className="w-5 h-5" />,
    path: '/profile',
  },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarExpanded, setSidebarExpanded, activeModule, setActiveModule } = useAppStore()
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set(['flows', 'skills', 'models', 'mcp-servers']))

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus.has(item.id)
    const isParentActive = item.children?.some((child) => isActive(child.path))

    return (
      <div key={item.id} className={level > 0 ? 'ml-4' : ''}>
        <Link
          to={item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleMenu(item.id)
            }
            setActiveModule(item.id)
          }}
          className={cn(
            'flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200',
            'hover:bg-white/10 group',
            'relative overflow-hidden',
            isActive(item.path) || isParentActive
              ? 'bg-white/20 text-white'
              : 'text-gray-300 hover:text-white'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'transition-colors duration-200',
                isActive(item.path) || isParentActive ? 'text-white' : 'text-primary-400'
              )}
            >
              {item.icon}
            </div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                {item.badge && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <AnimatePresence>
          {hasChildren && isExpanded && sidebarExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="py-2 space-y-1">
                {item.children?.map((child) => renderMenuItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.aside
      initial={{ width: sidebarExpanded ? 280 : 80 }}
      animate={{ width: sidebarExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-white/10 backdrop-blur-xl"
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">AgentFlow</h1>
                <p className="text-xs text-gray-400">AI Workflows</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!sidebarExpanded && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mx-auto">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* 底部用户信息 */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1"
              >
                <p className="text-white font-medium text-sm">User</p>
                <p className="text-gray-400 text-xs">Pro Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}