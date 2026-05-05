/**
 * FlowSpec 相关类型定义
 */

export interface FlowSpecMetadata {
  name: string
  version: string
  description?: string
  author?: string
  tags: string[]
  namespace?: string
}

export interface VariableReference {
  type: string
  path?: string
  default?: any
}

export interface NodeConfig {
  id: string
  type: string
  name?: string
  depends_on?: string[]
  config: Record<string, any>
  inputs: Record<string, string | VariableReference>
  outputs: Record<string, string>
}

export interface Stage {
  id: string
  name?: string
  description?: string
  steps: NodeConfig[]
}

export interface ErrorHandling {
  on_step_failure: {
    strategy: 'continue' | 'stop' | 'retry'
    max_retries: number
    retry_delay: number
  }
  on_stage_failure: {
    strategy: 'continue' | 'stop' | 'fallback'
    fallback_stage?: string
  }
}

export interface LearningConfig {
  enabled: boolean
  feedback_collection: boolean
  skill_extraction: boolean
}

export interface FlowSpecSpec {
  description?: string
  stages: Stage[]
  inputs: Record<string, VariableReference>
  outputs: Record<string, string>
  error_handling?: ErrorHandling
  learning?: LearningConfig
}

export interface FlowSpec {
  apiVersion: string
  kind: string
  metadata: FlowSpecMetadata
  spec: FlowSpecSpec
}

export interface FlowExecutionResult {
  run_id: string
  flow_id: string
  status: ExecutionStatus
  results: Record<string, NodeExecutionResult>
  variables: Record<string, any>
  logs: ExecutionLog[]
  metadata: {
    total_time: number
    total_cost: number
    nodes_executed: number
  }
}

export interface NodeExecutionResult {
  success: boolean
  outputs: Record<string, any>
  error?: string
  metadata: Record<string, any>
  execution_time: number
  cost: number
}

export interface ExecutionStatus {
  PENDING: 'pending'
  RUNNING: 'running'
  PAUSED: 'paused'
  COMPLETED: 'completed'
  FAILED: 'failed'
  CANCELLED: 'cancelled'
}

export type ExecutionStatusValue = ExecutionStatus[keyof ExecutionStatus]

export interface ExecutionLog {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  stage?: string
  node?: string
  [key: string]: any
}

export interface VariableScope {
  GLOBAL: 'global'
  STAGE: 'stage'
  NODE: 'node'
}

export type VariableScopeValue = VariableScope[keyof VariableScope]

export interface Variable {
  name: string
  value: any
  scope: VariableScopeValue
  source?: string
  created_at: string
  metadata: Record<string, any>
}

export interface ContextState {
  run_id: string
  flow_id: string
  status: ExecutionStatusValue
  variables: Record<VariableScopeValue, Record<string, Variable>>
  current_stage?: string
  current_node?: string
  execution_log: ExecutionLog[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}