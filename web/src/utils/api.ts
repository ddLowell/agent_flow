import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Flow 相关 API
  getFlows: (params?: any) => apiClient.get('/api/flows', { params }),
  getFlow: (id: string) => apiClient.get(`/api/flows/${id}`),
  createFlow: (data: any) => apiClient.post('/api/flows', data),
  updateFlow: (id: string, data: any) => apiClient.put(`/api/flows/${id}`, data),
  deleteFlow: (id: string) => apiClient.delete(`/api/flows/${id}`),
  executeFlow: (id: string, data?: any) => apiClient.post(`/api/flows/${id}/execute`, data),

  // Skill 相关 API
  getSkills: (params?: any) => apiClient.get('/api/skills', { params }),
  getSkill: (id: string) => apiClient.get(`/api/skills/${id}`),
  createSkill: (data: any) => apiClient.post('/api/skills', data),
  updateSkill: (id: string, data: any) => apiClient.put(`/api/skills/${id}`, data),
  deleteSkill: (id: string) => apiClient.delete(`/api/skills/${id}`),

  // Model 相关 API
  getModels: (params?: any) => apiClient.get('/api/models', { params }),
  getModel: (id: string) => apiClient.get(`/api/models/${id}`),
  registerModel: (data: any) => apiClient.post('/api/models', data),

  // MCP Server 相关 API
  getMCPServers: (params?: any) => apiClient.get('/api/mcp-servers', { params }),
  getMCPServer: (id: string) => apiClient.get(`/api/mcp-servers/${id}`),
  registerMCPServer: (data: any) => apiClient.post('/api/mcp-servers', data),

  // Execution 相关 API
  getExecutions: (params?: any) => apiClient.get('/api/executions', { params }),
  getExecution: (id: string) => apiClient.get(`/api/executions/${id}`),
  getExecutionLogs: (id: string) => apiClient.get(`/api/executions/${id}/logs`),

  // 系统相关 API
  getHealth: () => apiClient.get('/health'),
  getVersion: () => apiClient.get('/api/version'),
  getNodes: () => apiClient.get('/api/nodes'),
}

export default api