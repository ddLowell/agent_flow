import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export const Executions: React.FC = () => {
  return (
    <div className="h-full p-8 overflow-y-auto bg-[#0a0a0f]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">执行监控</h1>
            <p className="text-slate-400">监控 Flow 执行状态和性能指标</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: '总执行次数', value: '1,234', icon: Activity, color: 'cyan' },
            { label: '成功', value: '1,180', icon: CheckCircle, color: 'emerald' },
            { label: '失败', value: '54', icon: AlertCircle, color: 'rose' },
            { label: '平均耗时', value: '2.3s', icon: Clock, color: 'amber' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-5 rounded-xl bg-slate-900/50 border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-400 text-center py-12">执行监控功能开发中...</p>
        </div>
      </motion.div>
    </div>
  )
}
