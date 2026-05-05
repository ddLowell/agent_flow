// 基础类型定义
export interface Flow {
  id: string
  name: string
  description: string
  version: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  author: string
  tags: string[]
  steps: FlowStep[]
  metadata: Record<string, any>
}

export interface FlowStep {
  id: string
  name: string
  type: string
  description?: string
  config: Record<string, any>
  inputs: Record<string, any>
  outputs: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  dependsOn?: string[]
  position: { x: number; y: number }
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: string
  tags: string[]
  rating: number
  downloads: number
  price?: number
  status: 'draft' | 'published' | 'deprecated'
  installed?: boolean
  installDate?: string
  lastUsed?: string
  usageCount?: number
  config: {
    systemPrompt?: string
    tools?: any[]
    examples?: any[]
    parameters?: Record<string, any>
  }
}

export interface Model {
  id: string
  name: string
  provider: string
  type: 'llm' | 'embedding' | 'vision' | 'audio'
  capabilities: string[]
  pricing: {
    input: number
    output: number
    unit: string
  }
  status: 'active' | 'deprecated' | 'beta'
  description: string
}

export interface MCPServer {
  id: string
  name: string
  description: string
  version: string
  author: string
  tools: MCPTool[]
  status: 'active' | 'inactive' | 'deprecated'
  repository?: string
  documentation?: string
}

export interface MCPTool {
  name: string
  description: string
  parameters: Record<string, any>
  required: string[]
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  settings: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: boolean
  emailUpdates: boolean
  apiKeys: Record<string, string>
}

export interface Execution {
  id: string
  flowId: string
  flowName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  startTime: string
  endTime?: string
  duration?: number
  logs: ExecutionLog[]
  results?: Record<string, any>
  cost?: number
  metadata: Record<string, any>
}

export interface ExecutionLog {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
  step?: string
  metadata?: Record<string, any>
}

// UI 状态类型
export type SidebarItem = {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
  children?: SidebarItem[]
}

export type NavigationState = {
  currentPath: string
  sidebarExpanded: boolean
  activeModule: string
}