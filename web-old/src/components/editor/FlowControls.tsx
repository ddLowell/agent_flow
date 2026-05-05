/**
 * Flow Controls - 工具栏控制组件
 */

import React from 'react'

interface FlowControlsProps {
  onNewFlow: () => void
  onOpenFlow: () => void
  onSaveFlow: () => void
  onValidateFlow: () => void
}

export const FlowControls: React.FC<FlowControlsProps> = ({ 
  onNewFlow, 
  onOpenFlow, 
  onSaveFlow, 
  onValidateFlow 
}) => {
  return (
    <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
      <button 
        onClick={onNewFlow}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        New Flow
      </button>
      <button 
        onClick={onOpenFlow}
        className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
      >
        Open Flow
      </button>
      <button 
        onClick={onSaveFlow}
        className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
      >
        Save Flow
      </button>
      <button 
        onClick={onValidateFlow}
        className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
      >
        Validate
      </button>
    </div>
  )
}
