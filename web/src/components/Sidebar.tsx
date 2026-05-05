import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  SparklesIcon,
  ServerIcon,
  CpuChipIcon,
  BeakerIcon,
  CubeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '../store'
import { cn, generateId } from '../utils/helpers'

const sidebarItems = [
  {
    category: 'Workflows',
    items: [
      { id: 'flow-generator', label: 'Flow Generator', icon: SparklesIcon, path: '/flows/generate' },
      { id: 'flow-market', label: 'Flow Market', icon: CubeIcon, path: '/flows/market', badge: 12 },
      { id: 'flow-list', label: 'Flow List', icon: DocumentTextIcon, path: '/flows/list' },
    ],
  },
  {
    category: 'Skills',
    items: [
      { id: 'skill-create', label: 'Create Skill', icon: BeakerIcon, path: '/skills/create' },
      { id: 'skill-market', label: 'Skill Market', icon: ServerIcon, path: '/skills/market', badge: 5 },
    ],
  },
  {
    category: 'Models',
    items: [
      { id: 'model-register', label: 'Register Model', icon: CpuChipIcon, path: '/models/register' },
      { id: 'model-market', label: 'Model Market', icon: SparklesIcon, path: '/models/market' },
    ],
  },
  {
    category: 'MCP Servers',
    items: [
      { id: 'mcp-register', label: 'Register Server', icon: ServerIcon, path: '/mcp/register' },
      { id: 'mcp-market', label: 'MCP Market', icon: CubeIcon, path: '/mcp/market' },
    ],
  },
  {
    category: 'Settings',
    items: [
      { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
      { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
    ],
  },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  const { activeModule, setActiveModule, user } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = sidebarItems.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }))

  return (
    <motion.aside
      initial={false}
      animate={{
        width: expanded ? '320px' : '80px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-r border-slate-700/50"
    >
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    AgentFlow
                  </h1>
                  <p className="text-xs text-slate-400">AI Workflow Platform</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {expanded ? (
              <ChevronLeftIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {filteredItems.map((category) => (
          <div key={category.category}>
            <AnimatePresence mode="wait">
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-3 mb-2"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.category}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = item.icon
                const isActive = activeModule === item.id

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group',
                      isActive
                        ? 'bg-gradient-primary text-white shadow-glow'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    )}
                  >
                    <div className="flex-shrink-0 relative">
                      <Icon className="w-5 h-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <AnimatePresence mode="wait">
                      {expanded && (
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
                    {isActive && expanded && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 rounded-full bg-white shadow-glow"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 text-left"
              >
                <p className="text-sm font-medium text-white">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-400">{user?.email || 'user@agentflow.com'}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BellIcon className="w-5 h-5 text-slate-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}

export default Sidebar