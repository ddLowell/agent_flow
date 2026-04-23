/**
 * Flow Editor Store - Zustand + Immer
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { FlowSpec, NodeConfig, Stage, ExecutionStatusValue } from '@/types/flowspec'

interface FlowEditorState {
  // 当前编辑的 FlowSpec
  currentFlow: FlowSpec | null
  // Flow YAML 内容
  yamlContent: string
  // 选中的节点
  selectedNodeId: string | null
  // 选中的阶段
  selectedStageId: string | null
  // 编辑模式
  isEditing: boolean
  // 是否有未保存的更改
  hasUnsavedChanges: boolean
  // 执行状态
  executionStatus: ExecutionStatusValue
  // 当前运行 ID
  currentRunId: string | null
  // 执行结果
  executionResults: any | null
  // 执行日志
  executionLogs: any[]
  // 加载状态
  isLoading: boolean
  // 错误信息
  error: string | null

  // Actions
  setCurrentFlow: (flow: FlowSpec) => void
  setYamlContent: (content: string) => void
  updateNode: (stageId: string, nodeId: string, updates: Partial<NodeConfig>) => void
  addNode: (stageId: string, node: NodeConfig) => void
  removeNode: (stageId: string, nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  selectStage: (stageId: string | null) => void
  setEditing: (editing: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  setExecutionStatus: (status: ExecutionStatusValue) => void
  setCurrentRunId: (runId: string | null) => void
  setExecutionResults: (results: any) => void
  addExecutionLog: (log: any) => void
  clearExecutionLogs: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentFlow: null,
  yamlContent: '',
  selectedNodeId: null,
  selectedStageId: null,
  isEditing: false,
  hasUnsavedChanges: false,
  executionStatus: 'pending' as ExecutionStatusValue,
  currentRunId: null,
  executionResults: null,
  executionLogs: [],
  isLoading: false,
  error: null,
}

export const useFlowEditorStore = create<FlowEditorState>()(
  immer((set) => ({
    ...initialState,

    setCurrentFlow: (flow) =>
      set((state) => {
        state.currentFlow = flow
        state.hasUnsavedChanges = true
      }),

    setYamlContent: (content) =>
      set((state) => {
        state.yamlContent = content
        state.hasUnsavedChanges = true
      }),

    updateNode: (stageId, nodeId, updates) =>
      set((state) => {
        if (!state.currentFlow) return
        const stage = state.currentFlow.spec.stages.find((s) => s.id === stageId)
        if (!stage) return
        const node = stage.steps.find((n) => n.id === nodeId)
        if (!node) return
        Object.assign(node, updates)
        state.hasUnsavedChanges = true
      }),

    addNode: (stageId, node) =>
      set((state) => {
        if (!state.currentFlow) return
        const stage = state.currentFlow.spec.stages.find((s) => s.id === stageId)
        if (!stage) return
        stage.steps.push(node)
        state.hasUnsavedChanges = true
      }),

    removeNode: (stageId, nodeId) =>
      set((state) => {
        if (!state.currentFlow) return
        const stage = state.currentFlow.spec.stages.find((s) => s.id === stageId)
        if (!stage) return
        stage.steps = stage.steps.filter((n) => n.id !== nodeId)
        state.hasUnsavedChanges = true
      }),

    selectNode: (nodeId) =>
      set((state) => {
        state.selectedNodeId = nodeId
      }),

    selectStage: (stageId) =>
      set((state) => {
        state.selectedStageId = stageId
      }),

    setEditing: (editing) =>
      set((state) => {
        state.isEditing = editing
      }),

    setHasUnsavedChanges: (hasChanges) =>
      set((state) => {
        state.hasUnsavedChanges = hasChanges
      }),

    setExecutionStatus: (status) =>
      set((state) => {
        state.executionStatus = status
      }),

    setCurrentRunId: (runId) =>
      set((state) => {
        state.currentRunId = runId
      }),

    setExecutionResults: (results) =>
      set((state) => {
        state.executionResults = results
      }),

    addExecutionLog: (log) =>
      set((state) => {
        state.executionLogs.push(log)
      }),

    clearExecutionLogs: () =>
      set((state) => {
        state.executionLogs = []
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
      }),

    reset: () =>
      set((state) => {
        Object.assign(state, initialState)
      }),
  }))
)