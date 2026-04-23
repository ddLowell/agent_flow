/**
 * 执行监控面板
 */

import React, { useState, useEffect } from 'react'
import { useFlowEditorStore } from '@/hooks/useFlowEditor'
import { getStatusColor, formatTime, formatDuration, formatCost } from '@/utils'
import { Play, Pause, RotateCw, X, ChevronRight, ChevronDown } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'

export const MonitorPanel: React.FC = () => {
  const {
    currentRunId,
    executionStatus,
    executionLogs,
    executionResults,
    clearExecutionLogs,
  } = useFlowEditorStore()

  const [expandedLogs, setExpandedLogs] = useState(true)
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all')

  const filteredLogs = executionLogs.filter(log => 
    logFilter === 'all' || log.level === logFilter
  )

  const statusColor = getStatusColor(executionStatus)

  const handlePause = async () => {
    if (currentRunId) {
      try {
        const { apiClient } = await import('@/api/client')
        await apiClient.pauseExecution(currentRunId)
      } catch (error) {
        console.error('Failed to pause execution:', error)
      }
    }
  }

  const handleResume = async () => {
    if (currentRunId) {
      try {
        const { apiClient } = await import('@/api/client')
        await apiClient.resumeExecution(currentRunId)
      } catch (error) {
        console.error('Failed to resume execution:', error)
      }
    }
  }

  const handleCancel = async () => {
    if (currentRunId) {
      try {
        const { apiClient } = await import('@/api/client')
        await apiClient.cancelExecution(currentRunId)
        clearExecutionLogs()
      } catch (error) {
        console.error('Failed to cancel execution:', error)
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 状态栏 */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Execution Monitor</h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentRunId ? `Run ID: ${currentRunId}` : 'No active execution'}
              </p>
            </div>
            <div className={cn(
              'px-4 py-2 rounded-lg font-medium',
              `bg-${statusColor}-100 text-${statusColor}-700`
            )}>
              {executionStatus.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {executionStatus === 'running' && (
              <button
                onClick={handlePause}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Pause execution"
              >
                <Pause size={20} />
              </button>
            )}
            {executionStatus === 'paused' && (
              <button
                onClick={handleResume}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Resume execution"
              >
                <Play size={20} />
              </button>
            )}
            {executionStatus !== 'pending' && executionStatus !== 'completed' && (
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Cancel execution"
              >
                <X size={20} />
              </button>
            )}
            <button
              onClick={() => setExpandedLogs(!expandedLogs)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expandedLogs ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {expandedLogs && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 日志过滤 */}
          <div className="border-b bg-gray-50 px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <button
                onClick={() => setLogFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  logFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('info')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  logFilter === 'info' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                Info
              </button>
              <button
                onClick={() => setLogFilter('warning')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  logFilter === 'warning' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                Warning
              </button>
              <button
                onClick={() => setLogFilter('error')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  logFilter === 'error' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                )}
              >
                Error
              </button>
            </div>
          </div>

          {/* 日志列表 */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <RotateCw className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-sm">No logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log, index) => {
                  const levelColor = log.level === 'error' ? 'red' : 
                                    log.level === 'warning' ? 'yellow' : 'blue'
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex-shrink-0 px-2 py-1 rounded text-xs font-medium',
                          `text-${levelColor}-700 bg-${levelColor}-100`
                        )}>
                          {log.level.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-2">{log.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatTime(log.timestamp)}</span>
                            {log.stage && <span>Stage: {log.stage}</span>}
                            {log.node && <span>Node: {log.node}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 执行结果统计 */}
          {executionResults && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Execution Results</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-gray-900">
                    {executionResults.metadata?.total_time?.toFixed(2) || 0}s
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Total Time</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCost(executionResults.metadata?.total_cost || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Total Cost</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-gray-900">
                    {executionResults.metadata?.nodes_executed || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Nodes Executed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}