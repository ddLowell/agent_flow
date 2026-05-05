// MCP Server 类型定义

export interface MCPServer {
  id: string
  name: string
  version: string
  description: string
  author: string
  license: string
  homepage?: string
  repository?: string
  tags: string[]
  icon?: string
  transport: MCPTransport
  tools: MCPTool[]
  resources?: MCPResource[]
  status: 'active' | 'inactive' | 'error'
  installed?: boolean
  installDate?: string
  lastUsed?: string
  usageCount?: number
}

export interface MCPTransport {
  type: 'stdio' | 'http' | 'sse'
  config: MCPTransportConfig
}

export interface MCPTransportConfig {
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  baseUrl?: string
  headers?: Record<string, string>
  timeout?: number
  endpoint?: string
  reconnect?: boolean
}

export interface MCPTool {
  name: string
  description: string
  parameters: MCPParameterSchema
  returns?: MCPReturnSchema
}

export interface MCPParameterSchema {
  type: 'object'
  properties: Record<string, MCPParameterProperty>
  required?: string[]
}

export interface MCPParameterProperty {
  type: string
  description: string
  default?: any
  enum?: string[]
  minimum?: number
  maximum?: number
}

export interface MCPReturnSchema {
  type: string
  description?: string
  properties?: Record<string, any>
  items?: any
}

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
  schema?: any
}

export interface MCPServerCategory {
  id: string
  label: string
  icon: string
  count: number
}

export interface MCPToolExecution {
  serverId: string
  toolName: string
  arguments: Record<string, any>
  result?: any
  error?: string
  executionTime?: number
  timestamp: string
}
