import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

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

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}m`
  } else if (cost < 1) {
    return `$${(cost * 100).toFixed(2)}c`
  } else {
    return `$${cost.toFixed(4)}`
  }
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    paused: 'bg-yellow-500',
    archived: 'bg-gray-400',
    deprecated: 'bg-orange-500',
    published: 'bg-green-400',
    draft: 'bg-blue-400',
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    beta: 'bg-purple-400',
  }
  return colorMap[status] || 'bg-gray-500'
}

export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}