/**
 * 工具函数
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化时间
 */
export function formatTime(date: string | Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr)
}

/**
 * 格式化持续时间
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs.toFixed(0)}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

/**
 * 格式化成本
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}m`
  } else if (cost < 1) {
    return `$${(cost * 100).toFixed(2)}c`
  } else {
    return `$${cost.toFixed(4)}`
  }
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 节点类型颜色映射
 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  script: 'bg-blue-500',
  mcp_server: 'bg-purple-500',
  agent_skill: 'bg-green-500',
  rag: 'bg-yellow-500',
  conditional: 'bg-orange-500',
  loop: 'bg-pink-500',
  parallel: 'bg-cyan-500',
  human: 'bg-red-500',
  retry: 'bg-indigo-500',
  transform: 'bg-teal-500',
  http: 'bg-gray-500',
}

/**
 * 获取节点类型颜色
 */
export function getNodeTypeColor(nodeType: string): string {
  return NODE_TYPE_COLORS[nodeType] || 'bg-gray-500'
}

/**
 * 执行状态颜色映射
 */
export const STATUS_COLORS: Record<string, string> = {
  pending: 'gray',
  running: 'blue',
  paused: 'yellow',
  completed: 'green',
  failed: 'red',
  cancelled: 'gray',
}

/**
 * 获取执行状态颜色
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'gray'
}

/**
 * 日志级别颜色映射
 */
export const LOG_LEVEL_COLORS: Record<string, string> = {
  info: 'blue',
  warning: 'yellow',
  error: 'red',
}

/**
 * 获取日志级别颜色
 */
export function getLogLevelColor(level: string): string {
  return LOG_LEVEL_COLORS[level] || 'gray'
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 检查对象是否为空
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string') return obj.trim().length === 0
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    return defaultValue
  }
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * 验证 YAML 文件
 */
export function isValidYamlFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return ext === 'yaml' || ext === 'yml'
}