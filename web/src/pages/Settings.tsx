import React from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react'

export const Settings: React.FC = () => {
  return (
    <div className="h-full p-8 overflow-y-auto bg-[#0a0a0f]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30 flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">设置</h1>
            <p className="text-slate-400">配置系统参数和个性化选项</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { title: '账户设置', icon: User, desc: '管理个人信息和登录凭证' },
            { title: '通知设置', icon: Bell, desc: '配置消息通知方式' },
            { title: '安全设置', icon: Shield, desc: '管理 API 密钥和访问权限' },
            { title: '数据管理', icon: Database, desc: '备份和恢复数据' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
