# AgentFlow

一个基于 Python 的自定义 Agent 工作流管理系统，提供完整的 Agent Flow 设计、执行、监控和评估能力。

## 项目文档

完整的项目设计文档请查看 [DESIGN.md](./DESIGN.md)

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务器
python -m agentflow.server

# 使用 CLI 工具
agentflow-cli --help
```

## 特性

- ✅ 可视化 Flow 编辑器（基于 React Flow）
- ✅ FlowSpec YAML 定义规范
- ✅ 多种节点类型（MCP Server、Agent Skill、RAG、自定义脚本、条件、循环等）
- ✅ 实时监控和调试
- ✅ 人机交互介入
- ✅ 短期和长期记忆管理
- ✅ 模型管理和注册
- ✅ 技能市场
- ✅ 评估和对比
- ✅ CLI 工具支持

## 架构设计

项目参考了以下框架的设计理念：
- **OpenClaw**: Gateway-first 架构、ReAct-loop Brain
- **Hermes**: 学习循环、分层记忆、自主技能创建
- **Harness**: Pipeline-as-Code、YAML 定义、Stage/Step 架构

## 目录结构

```
AgentFlow/
├── agentflow/              # 后端核心模块
│   ├── core/              # 核心引擎
│   ├── nodes/             # 节点实现
│   ├── memory/            # 记忆管理
│   ├── models/            # 模型管理
│   ├── skills/            # 技能市场
│   └── cli/               # CLI 工具
├── web/                   # 前端 React 应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── editor/        # Flow 编辑器
│   │   ├── monitor/       # 监控面板
│   │   └── api/           # API 客户端
│   └── package.json
├── flows/                 # FlowSpec YAML 文件
├── docs/                  # 文档
├── DESIGN.md             # 完整设计文档
└── README.md             # 本文件
```

## 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

MIT License