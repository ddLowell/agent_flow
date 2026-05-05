import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Flow, Skill, Model, MCPServer, Execution, User } from '../types'

interface AppState {
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void

  // 当前选中的 Flow
  currentFlow: Flow | null
  setCurrentFlow: (flow: Flow | null) => void

  // 当前选中的 Skill
  currentSkill: Skill | null
  setCurrentSkill: (skill: Skill | null) => void

  // 当前选中的模型
  currentModel: Model | null
  setCurrentModel: (model: Model | null) => void

  // 当前选中的 MCP Server
  currentMCPServer: MCPServer | null
  setCurrentMCPServer: (server: MCPServer | null) => void

  // 当前的执行记录
  currentExecution: Execution | null
  setCurrentExecution: (execution: Execution | null) => void

  // UI 状态
  sidebarExpanded: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void

  activeModule: string
  setActiveModule: (module: string) => void

  isLoading: boolean
  setLoading: (loading: boolean) => void

  error: string | null
  setError: (error: string | null) => void

  // 通知状态
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    // 用户信息
    user: null,
    setUser: (user) =>
      set((state) => {
        state.user = user
      }),

    // Flow 相关
    currentFlow: null,
    setCurrentFlow: (flow) =>
      set((state) => {
        state.currentFlow = flow
      }),

    // Skill 相关
    currentSkill: null,
    setCurrentSkill: (skill) =>
      set((state) => {
        state.currentSkill = skill
      }),

    // Model 相关
    currentModel: null,
    setCurrentModel: (model) =>
      set((state) => {
        state.currentModel = model
      }),

    // MCP Server 相关
    currentMCPServer: null,
    setCurrentMCPServer: (server) =>
      set((state) => {
        state.currentMCPServer = server
      }),

    // Execution 相关
    currentExecution: null,
    setCurrentExecution: (execution) =>
      set((state) => {
        state.currentExecution = execution
      }),

    // UI 状态
    sidebarExpanded: true,
    toggleSidebar: () =>
      set((state) => {
        state.sidebarExpanded = !state.sidebarExpanded
      }),
    setSidebarExpanded: (expanded) =>
      set((state) => {
        state.sidebarExpanded = expanded
      }),

    activeModule: 'flows',
    setActiveModule: (module) =>
      set((state) => {
        state.activeModule = module
      }),

    isLoading: false,
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    error: null,
    setError: (error) =>
      set((state) => {
        state.error = error
      }),

    // 通知系统
    notifications: [],
    addNotification: (notification) =>
      set((state) => {
        const newNotification: Notification = {
          id: Math.random().toString(36).substring(2, 9),
          ...notification,
        }
        state.notifications.push(newNotification)

        // 自动删除通知
        if (notification.duration !== 0) {
          setTimeout(() => {
            set((s) => {
              s.notifications = s.notifications.filter((n) => n.id !== newNotification.id)
            })
          }, notification.duration || 3000)
        }
      }),
    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== id)
      }),
  }))
)