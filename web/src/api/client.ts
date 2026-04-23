/**
 * API 客户端
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 处理认证错误
          console.error('Unauthorized access')
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * 验证 FlowSpec
   */
  async validateFlow(flowContent: string, verbose: boolean = false): Promise<any> {
    const response: AxiosResponse = await this.client.post('/api/validate', {
      flow_spec: flowContent,
      verbose,
    })
    return response.data
  }

  /**
   * 执行 Flow
   */
  async executeFlow(
    flowContent: string,
    inputData?: Record<string, any>,
    options: {
      watch?: boolean
      save_state?: boolean
      run_id?: string
    } = {}
  ): Promise<any> {
    const response: AxiosResponse = await this.client.post('/api/execute', {
      flow_spec: flowContent,
      inputs: inputData,
      ...options,
    })
    return response.data
  }

  /**
   * 获取执行状态
   */
  async getExecutionStatus(runId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/api/status/${runId}`)
    return response.data
  }

  /**
   * 列出所有 Flow
   */
  async listFlows(directory: string = './flows', verbose: boolean = false): Promise<any> {
    const response: AxiosResponse = await this.client.get('/api/flows', {
      params: { directory, verbose },
    })
    return response.data
  }

  /**
   * 列出所有注册的节点
   */
  async listNodes(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/api/nodes')
    return response.data
  }

  /**
   * 暂停执行
   */
  async pauseExecution(runId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/api/pause/${runId}`)
    return response.data
  }

  /**
   * 恢复执行
   */
  async resumeExecution(runId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/api/resume/${runId}`)
    return response.data
  }

  /**
   * 取消执行
   */
  async cancelExecution(runId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/api/cancel/${runId}`)
    return response.data
  }

  /**
   * 获取版本信息
   */
  async getVersion(): Promise<{ version: string }> {
    const response: AxiosResponse = await this.client.get('/api/version')
    return response.data
  }

  /**
   * 获取 Flow 详情
   */
  async getFlowDetails(flowPath: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/api/flow-details', {
      flow_path: flowPath,
    })
    return response.data
  }

  /**
   * 流式执行日志
   */
  async streamExecutionLogs(
    flowContent: string,
    inputData?: Record<string, any>,
    onLog: (log: any) => void,
    onComplete: (result: any) => void,
    onError: (error: any) => void
  ): Promise<void> {
    const response = await this.client.post('/api/stream-execute', {
      flow_spec: flowContent,
      inputs: inputData,
    }, {
      responseType: 'stream',
    })

    const reader = response.data.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.type === 'log') {
              onLog(data)
            } else if (data.type === 'completion') {
              onComplete(data)
              return
            } else if (data.type === 'error') {
              onError(data)
              return
            }
          } catch (e) {
            console.error('Error parsing log line:', e)
          }
        }
      }
    } catch (error) {
      onError(error)
    }
  }

  /**
   * 上传 Flow 文件
   */
  async uploadFlow(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse = await this.client.post('/api/upload-flow', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * 保存 Flow 文件
   */
  async saveFlow(flowPath: string, flowContent: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/api/save-flow', {
      flow_path: flowPath,
      flow_content: flowContent,
    })
    return response.data
  }

  /**
   * 删除 Flow 文件
   */
  async deleteFlow(flowPath: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/api/delete-flow', {
      flow_path: flowPath,
    })
    return response.data
  }
}

// 创建默认实例
export const apiClient = new ApiClient()