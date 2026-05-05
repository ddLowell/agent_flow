import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  Code,
  Zap,
  Database,
  GitBranch,
  Repeat,
  Users,
  MoreHorizontal,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn, formatDuration, formatCost, getStatusColor } from '../../utils/helpers'
import { Flow, FlowStep } from '../../types'

interface FlowDetailProps {
  flow: Flow
  onExecute?: () => void
  onPause?: () => void
}

export const FlowDetail: React.FC<FlowDetailProps> = ({ flow, onExecute, onPause }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // 模拟的 step 数据
  const mockSteps: FlowStep[] = [
    {
      id: 'step-1',
      name: '文档预处理',
      type: 'script',
      description: '解析和清洗输入文档',
      config: { language: 'python', timeout: 30 },
      inputs: { document: 'input_doc.pdf' },
      outputs: { cleaned_text: 'output.txt' },
      status: 'completed',
      position: { x: 100, y: 100 }
    },
    {
      id: 'step-2',
      name: '文本分析',
      type: 'agent_skill',
      description: '使用 AI 分析文档内容',
      config: { model: 'gpt-4', max_tokens: 2000 },
      inputs: { text: 'step-1.cleaned_text' },
      outputs: { analysis: 'analysis.json' },
      status: 'running',
      dependsOn: ['step-1'],
      position: { x: 100, y: 300 }
    },
    {
      id: 'step-3',
      name: '摘要生成',
      type: 'agent_skill',
      description: '生成文档摘要',
      config: { model: 'gpt-3.5', summary_length: 'short' },
      inputs: { analysis: 'step-2.analysis' },
      outputs: { summary: 'summary.txt' },
      status: 'pending',
      dependsOn: ['step-2'],
      position: { x: 100, y: 500 }
    }
  ]

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const handleExecute = () => {
    setIsExecuting(true)
    onExecute?.()
  }

  const handlePause = () => {
    setIsExecuting(false)
    onPause?.()
  }

  const getStepIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      script: Code,
      agent_skill: Zap,
      mcp_server: Database,
      conditional: GitBranch,
      loop: Repeat,
      parallel: Users,
    }
    return iconMap[type] || Code
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部信息 */}
      <div className="glass-effect rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{flow.name}</h1>
            <p className="text-white/70 mb-4">{flow.description}</p>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                v{flow.version}
              </span>
              <span className="text-white/60 text-sm">作者: {flow.author}</span>
              <span className="text-white/60 text-sm">
                创建于: {new Date(flow.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isExecuting ? (
              <button
                onClick={handleExecute}
                className="px-6 py-3 bg-gradient-primary rounded-xl text-white font-medium hover:shadow-glow transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                执行流程
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-yellow-500 rounded-xl text-white font-medium hover:shadow-glow transition-all duration-300 flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                暂停执行
              </button>
            )}
            <button className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Code className="w-4 h-4" />
              总步骤数
            </div>
            <div className="text-2xl font-bold text-white">{mockSteps.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              已完成
            </div>
            <div className="text-2xl font-bold text-white">
              {mockSteps.filter(s => s.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Clock className="w-4 h-4" />
              预估时间
            </div>
            <div className="text-2xl font-bold text-white">2.5s</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              预估成本
            </div>
            <div className="text-2xl font-bold text-white">$0.012</div>
          </div>
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">执行步骤</h2>
        {mockSteps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id)
          const isActive = activeStep === step.id
          const StepIcon = getStepIcon(step.type)

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'glass-effect rounded-xl overflow-hidden transition-all duration-300',
                isActive && 'ring-2 ring-blue-500 shadow-glow'
              )}
            >
              {/* 步骤头部 */}
              <div
                onClick={() => {
                  setActiveStep(step.id)
                  toggleStep(step.id)
                }}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                {/* 状态指示器 */}
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', getStatusColor(step.status))}>
                  {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                  {step.status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  {step.status === 'failed' && <XCircle className="w-4 h-4 text-white" />}
                  {step.status === 'pending' && <Clock className="w-4 h-4 text-white" />}
                </div>

                {/* 步骤图标 */}
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-white" />
                </div>

                {/* 步骤信息 */}
                <div className="flex-1">
                  <h3 className="text-white font-medium">{step.name}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </div>

                {/* 右侧信息 */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white/60 text-xs">类型</div>
                    <div className="text-white text-sm font-medium">{step.type}</div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
                  </button>
                </div>
              </div>

              {/* 展开的详情 */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-6 space-y-4">
                      {/* 配置信息 */}
                      <div>
                        <h4 className="text-white/60 text-sm mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          配置参数
                        </h4>
                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                          {Object.entries(step.config).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-white/60 text-sm">{key}</span>
                              <span className="text-white text-sm font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 输入输出 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white/60 text-sm mb-2">输入</h4>
                          <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            {Object.entries(step.inputs).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-white/60 text-xs">{key}</span>
                                <span className="text-white text-xs truncate">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white/60 text-sm mb-2">输出</h4>
                          <div className="bg-white/5 rounded-lg p-4 space-y-2">
                            {Object.entries(step.outputs).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-white/60 text-xs">{key}</span>
                                <span className="text-white text-xs truncate">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 依赖关系 */}
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <div>
                          <h4 className="text-white/60 text-sm mb-2 flex items-center gap-2">
                            <GitBranch className="w-4 h-4" />
                            依赖关系
                          </h4>
                          <div className="flex gap-2">
                            {step.dependsOn.map((depId, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                                {depId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm transition-colors">
                          编辑配置
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm transition-colors">
                          查看日志
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm transition-colors flex items-center gap-2">
                          <MoreHorizontal className="w-4 h-4" />
                          更多
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}