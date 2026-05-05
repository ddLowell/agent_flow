import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Plus, 
  CheckCircle, 
  Zap,
  Database,
  Globe
} from 'lucide-react'

export default function Dashboard() {
  const [flows] = useState([
    {
      id: '1',
      name: '文档处理流程',
      description: '自动化处理文档的完整流程',
      status: 'completed',
      steps: 5,
      lastRun: '2小时前',
    },
    {
      id: '2', 
      name: '客户服务机器人',
      description: '智能客户服务响应系统',
      status: 'running',
      steps: 8,
      lastRun: '进行中',
    },
    {
      id: '3',
      name: '数据分析报告',
      description: '自动生成数据分析报告',
      status: 'pending',
      steps: 6,
      lastRun: '未运行',
    },
  ])

  const stats = [
    { label: '总流程数', value: '12', icon: Globe, color: 'text-blue-500' },
    { label: '活跃节点', value: '48', icon: Zap, color: 'text-green-500' },
    { label: '今日执行', value: '156', icon: Play, color: 'text-purple-500' },
    { label: '成功率', value: '98.5%', icon: CheckCircle, color: 'text-teal-500' },
  ]

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* 顶部欢迎区域 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <div className="relative glass-effect p-8 rounded-2xl text-white">
          <h1 className="text-4xl font-bold mb-2">欢迎回来！</h1>
          <p className="text-lg opacity-90">管理您的 AI 智能体工作流程</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-6 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-effect p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">最近流程</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              查看全部
            </button>
          </div>
          <div className="space-y-4">
            {flows.map((flow, index) => (
              <motion.div
                key={flow.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    flow.status === 'completed' ? 'bg-green-500' :
                    flow.status === 'running' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{flow.name}</h3>
                    <p className="text-sm text-gray-600">{flow.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{flow.steps} 步骤</p>
                  <p className="text-xs text-gray-400">{flow.lastRun}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-effect p-6 rounded-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">快速操作</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">创建新流程</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
              <Play className="w-5 h-5" />
              <span className="font-medium">运行现有流程</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-white/70 text-gray-900 rounded-lg hover:bg-white/90 transition-colors border border-gray-200">
              <Database className="w-5 h-5" />
              <span className="font-medium">浏览市场</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
