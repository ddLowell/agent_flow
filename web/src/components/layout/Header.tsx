import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AF</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">AgentFlow</h1>
        </div>
        <nav className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50">
            Flows
          </button>
          <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50">
            Monitor
          </button>
          <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50">
            Settings
          </button>
        </nav>
      </div>
    </header>
  )
}
