/**
 * Flow Dashboard - Dashboard page
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Play, Settings, Plus, Clock, TrendingUp } from 'lucide-react'

export const Dashboard: React.FC = () => {
  // 模拟的 flow 数据
  const flows = [
    {
      id: '1',
      name: 'Hello World Flow',
      description: 'Simple greeting workflow',
      version: '1.0.0',
      lastModified: '2026-04-22T10:30:00Z',
      executions: 15,
      status: 'completed',
    },
    {
      id: '2',
      name: 'Research Pipeline',
      description: 'Document analysis and summarization',
      version: '2.0.0',
      lastModified: '2026-04-21T15:20:00Z',
      executions: 8,
      status: 'failed',
    },
    {
      id: '3',
      name: 'Data Processing',
      description: 'ETL workflow with validation',
      version: '1.5.0',
      lastModified: '2026-04-22T09:15:00Z',
      executions: 23,
      status: 'running',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flow Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your AI agent workflows</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={20} />
          <span className="font-medium">Create Flow</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FolderOpen size={20} />
            <span className="text-sm font-medium">Total Flows</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Play size={20} />
            <span className="text-sm font-medium">Running</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">3</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-green-600">89%</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium">Total Executions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">847</div>
        </div>
      </div>

      {/* Flow List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Flows</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {flows.map((flow) => (
            <Link
              key={flow.id}
              to={`/editor/${flow.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {flow.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      v{flow.version}
                    </span>
                    {flow.status === 'running' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{flow.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Executions: {flow.executions}</span>
                    <span>Modified: {new Date(flow.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Execute Flow"
                  >
                    <Play size={16} className="text-green-600" />
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Flow Settings"
                  >
                    <Settings size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/editor"
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <FolderOpen size={28} />
            <div className="text-2xl font-bold">12</div>
          </div>
          <div className="font-medium">Create New Flow</div>
        </Link>

        <Link
          to="/monitor"
          className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={28} />
            <div className="text-2xl font-bold">847</div>
          </div>
          <div className="font-medium">View Executions</div>
        </Link>

        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={28} />
            <div className="text-2xl font-bold">98.5%</div>
          </div>
          <div className="font-medium">Success Rate</div>
        </div>
      </div>
    </div>
  )
}
