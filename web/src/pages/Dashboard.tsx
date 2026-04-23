/**
 * Dashboard Page - Flow overview and management
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { FlowSpec } from '@/types/flowspec'
import { formatTime, cn } from '@/utils'
import { Plus, Play, FileText, Trash2 } from 'lucide-react'

interface FlowItem {
  path: string
  name: string
  version: string
  description: string
  modifiedAt: string
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [flows, setFlows] = useState<FlowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    try {
      setIsLoading(true)
      const result = await apiClient.listFlows('./flows', true)
      setFlows(result.flows || [])
    } catch (err) {
      setError(err.message || 'Failed to load flows')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlowClick = (flowPath: string) => {
    navigate(`/editor/${encodeURIComponent(flowPath)}`)
  }

  const handleNewFlow = () => {
    navigate('/editor')
  }

  const handleDeleteFlow = async (flowPath: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!confirm('Are you sure you want to delete this flow?')) {
      return
    }

    try {
      await apiClient.deleteFlow(flowPath)
      await loadFlows() // Reload flows
    } catch (err) {
      setError(err.message || 'Failed to delete flow')
    }
  }

  const handleExecuteFlow = async (flowPath: string, event: React.MouseEvent) => {
    event.stopPropagation()
    navigate(`/monitor`)
    // Could trigger execution here
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flows</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your agent workflows</p>
        </div>
        <button
          onClick={handleNewFlow}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">New Flow</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {flows.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <FileText size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No flows yet</h3>
              <p className="text-gray-600 mb-6">Create your first agent workflow to get started</p>
              <button
                onClick={handleNewFlow}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Flow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flows.map((flow) => (
                <div
                  key={flow.path}
                  onClick={() => handleFlowClick(flow.path)}
                  className="bg-white rounded-lg border-2 border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {flow.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{flow.version}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExecuteFlow(flow.path, e)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Execute"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFlow(flow.path, e)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {flow.description || 'No description provided'}
                  </p>

                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium">Modified:</span>
                    <span>{formatTime(flow.modifiedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}