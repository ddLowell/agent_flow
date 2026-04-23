/**
 * Execution Monitor Component - 执行监控面板
 */

import React, { useEffect, useState } from 'react'
import { Play, Pause, Square, RefreshCw, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatTime, formatDuration, formatCost, getStatusColor } from '@/utils'
import { ExecutionLog, ExecutionStatusValue } from '@/types/flowspec'

interface ExecutionMonitorProps {
  runId: string
  status: ExecutionStatusValue
  logs: ExecutionLog[]
  metadata: {
    total_time: number
    total_cost: number
    nodes_executed: number
  }
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  runId,
  status,
  logs,
  metadata,
  onPause,
  onResume,
  onCancel
}) => {
  const [autoScroll, setAutoScroll] = useState(true)

  const statusIcon = {
    pending: <Clock className="w-4 h-4" />,
    running: <Play className="w-4 h-4" />,
    paused: <Pause className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />,
    cancelled: <Square className="w-4 h-4" />,
  }

  const getStatusText = (status: ExecutionStatusValue) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  useEffect(() => {
    if (autoScroll) {
      const logContainer = document.getElementById('execution-logs')
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    }
  }, [logs, autoScroll])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 状态栏 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${getStatusColor(status)}-100 text-${getStatusColor(status)}-600`}>
              {statusIcon[status]}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Execution Status: {getStatusText(status)}
              </div>
              <div className="text-xs text-gray-500">
                Run ID: {runId}
              </div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-2">
            {status === 'running' && onPause && (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
              >
                <Pause size={14} />
                Pause
              </button>
            )}
            {status === 'paused' && onResume && (
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                <Play size={14} />
                Resume
              </button>
            )}
            {(status === 'running' || status === 'paused') && onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                <Square size={14} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(metadata.total_time)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCost(metadata.total_cost)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Nodes Executed</div>
            <div className="text-lg font-semibold text-gray-900">
              {metadata.nodes_executed}
            </div>
          </div>
        </div>
      </div>

      {/* 执行日志 */}
      <div className="border-t border-gray-100">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Execution Logs</h3>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
        </div>

        <div
          id="execution-logs"
          className="p-4 h-96 overflow-y-auto font-mono text-sm bg-gray-900"
        >
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs yet. Start execution to see logs.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-2 flex items-start gap-2 ${
                  log.level === 'error' ? 'text-red-400' : 
                  log.level === 'warning' ? 'text-yellow-400' : 
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-500">{formatTime(log.timestamp)}:</span>
                <span className="text-gray-400">[{log.level.toUpperCase()}]</span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
