/**
 * AgentFlow Web Application
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { FlowEditor } from './components/editor/FlowEditor'
import { MonitorPanel } from './components/monitor/MonitorPanel'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route path="/editor" element={<FlowEditor />} />
        <Route path="/monitor" element={<MonitorPanel />} />
        <Route path="/editor/:flowId" element={<FlowEditor />} />
      </Routes>
    </MainLayout>
  )
}

export default App
