# AgentFlow Skills 规范

## 概述

Skill 是 AgentFlow 平台中的核心组件，它定义了 AI Agent 的能力和行为。每个 Skill 都是一个可复用的功能模块，可以被多个 Flow 和 Agent 使用。

## Skill 结构

### 基本字段

```json
{
  "id": "unique-skill-id",
  "name": "skill-name",
  "description": "Skill 的详细描述",
  "version": "1.0.0",
  "author": "Author Name",
  "category": "text|code|analysis|vision|document",
  "tags": ["tag1", "tag2"],
  "rating": 4.8,
  "downloads": 1000,
  "price": 0.01,
  "status": "draft|published|deprecated",
  "config": {
    "systemPrompt": "系统提示词",
    "tools": [],
    "examples": [],
    "parameters": {}
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | Skill 唯一标识符 |
| name | string | 是 | Skill 名称，使用小写字母和连字符 |
| description | string | 是 | Skill 功能描述 |
| version | string | 是 | 语义化版本号 |
| author | string | 是 | 作者名称 |
| category | string | 是 | 分类：text/code/analysis/vision/document |
| tags | array | 否 | 标签数组 |
| rating | number | 否 | 评分 (0-5) |
| downloads | number | 否 | 下载次数 |
| price | number | 否 | 每次调用价格 (USD)，0 表示免费 |
| status | string | 是 | 状态：draft/published/deprecated |
| config | object | 是 | Skill 配置 |

## 接入方式

### 1. Prompt 模板 (推荐)

最简单的接入方式，通过系统提示词定义 Skill 行为。

**适用场景**：
- 文本生成和处理
- 对话式交互
- 内容分析和总结

**配置示例**：
```json
{
  "integration": {
    "type": "prompt",
    "config": {
      "systemPrompt": "You are an expert document summarizer...",
      "temperature": 0.7,
      "maxTokens": 2000,
      "model": "gpt-4"
    }
  }
}
```

### 2. Function Calling

使用函数调用方式扩展 AI 能力。

**适用场景**：
- 需要执行特定操作
- 与外部系统交互
- 数据处理和转换

**配置示例**：
```json
{
  "integration": {
    "type": "function",
    "config": {
      "functions": [
        {
          "name": "get_weather",
          "description": "获取指定城市的天气信息",
          "parameters": {
            "type": "object",
            "properties": {
              "city": {
                "type": "string",
                "description": "城市名称"
              },
              "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "温度单位"
              }
            },
            "required": ["city"]
          }
        }
      ]
    }
  }
}
```

### 3. MCP Server

通过 MCP (Model Context Protocol) 协议连接外部服务。

**适用场景**：
- 复杂的外部系统集成
- 需要持久化连接
- 多工具组合场景

**配置示例**：
```json
{
  "integration": {
    "type": "mcp",
    "config": {
      "server": "weather-server",
      "transport": "stdio",
      "command": "python weather_server.py",
      "tools": ["get_weather", "get_forecast"]
    }
  }
}
```

### 4. API 集成

直接调用 REST API 或 GraphQL。

**适用场景**：
- 第三方服务集成
- 已有 API 的封装
- 快速原型开发

**配置示例**：
```json
{
  "integration": {
    "type": "api",
    "config": {
      "endpoint": "https://api.example.com/v1/summarize",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer ${API_KEY}",
        "Content-Type": "application/json"
      },
      "timeout": 30000,
      "retry": 3
    }
  }
}
```

## 工具定义

工具是 Skill 可调用的功能单元。

### 工具结构

```json
{
  "name": "tool-name",
  "description": "工具描述",
  "parameters": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "参数描述"
      }
    },
    "required": ["param1"]
  }
}
```

### 参数类型

- `string`: 字符串
- `integer`: 整数
- `number`: 浮点数
- `boolean`: 布尔值
- `array`: 数组
- `object`: 对象

## 开发指南

### 1. 创建 Skill

1. 进入 Skill Market 页面
2. 点击"创建 Skill"
3. 填写基本信息（名称、描述、分类等）
4. 配置系统提示词
5. 定义可用工具
6. 选择接入方式
7. 预览并保存

### 2. 系统提示词编写

好的系统提示词应该：

- **明确定义角色**：告诉 AI 它是什么角色
- **说明能力范围**：列出可以做什么
- **提供示例**：给出输入输出示例
- **设定约束**：说明限制和边界

**示例**：
```
You are an expert code reviewer with 10 years of experience.

Your responsibilities:
1. Review code for bugs, security issues, and performance problems
2. Suggest improvements following best practices
3. Provide clear, actionable feedback

Constraints:
- Focus on critical issues first
- Be constructive and professional
- Consider the context and use case

Example:
Input: function add(a, b) { return a + b }
Output: The function looks good, but consider adding type checking...
```

### 3. 测试 Skill

在发布前，应该：

1. **功能测试**：验证所有功能正常工作
2. **边界测试**：测试异常输入和边界情况
3. **性能测试**：评估响应时间和资源消耗
4. **安全测试**：检查潜在的安全问题

### 4. 发布 Skill

1. 确保所有必填字段已填写
2. 添加清晰的描述和使用说明
3. 设置合理的价格（如果是付费 Skill）
4. 添加相关标签以便搜索
5. 提交审核（如果需要）

## 最佳实践

### 命名规范

- 使用小写字母和连字符：`smart-summarizer`
- 名称应该简洁且有意义
- 避免使用特殊字符

### 版本管理

- 使用语义化版本：`MAJOR.MINOR.PATCH`
- MAJOR：不兼容的 API 更改
- MINOR：向后兼容的功能添加
- PATCH：向后兼容的问题修复

### 文档编写

- 提供清晰的描述
- 包含使用示例
- 说明输入输出格式
- 列出已知限制

### 错误处理

- 提供有意义的错误信息
- 优雅地处理异常情况
- 记录错误日志

## 示例 Skills

### 1. 智能摘要生成器

```json
{
  "name": "smart-summarizer",
  "description": "基于 AI 的智能文档摘要生成",
  "category": "document",
  "config": {
    "systemPrompt": "You are an expert document summarizer...",
    "tools": [
      {
        "name": "summarize",
        "description": "生成文档摘要",
        "parameters": {
          "type": "object",
          "properties": {
            "text": { "type": "string" },
            "maxLength": { "type": "integer" }
          },
          "required": ["text"]
        }
      }
    ]
  }
}
```

### 2. 代码审查助手

```json
{
  "name": "code-reviewer",
  "description": "自动代码审查和质量检查",
  "category": "code",
  "config": {
    "systemPrompt": "You are a senior code reviewer...",
    "tools": [
      {
        "name": "review_code",
        "description": "审查代码",
        "parameters": {
          "type": "object",
          "properties": {
            "code": { "type": "string" },
            "language": { "type": "string" }
          },
          "required": ["code", "language"]
        }
      }
    ]
  }
}
```

### 3. 数据分析助手

```json
{
  "name": "data-analyst",
  "description": "数据分析和可视化",
  "category": "analysis",
  "config": {
    "systemPrompt": "You are a data analysis expert...",
    "tools": [
      {
        "name": "analyze",
        "description": "分析数据集",
        "parameters": {
          "type": "object",
          "properties": {
            "data": { "type": "array" },
            "metrics": { "type": "array" }
          },
          "required": ["data"]
        }
      }
    ]
  }
}
```

## 故障排除

### 常见问题

1. **Skill 无法加载**
   - 检查 JSON 格式是否正确
   - 验证所有必填字段
   - 检查版本号格式

2. **工具调用失败**
   - 检查参数类型是否匹配
   - 验证必需参数是否提供
   - 查看错误日志

3. **响应不符合预期**
   - 优化系统提示词
   - 添加更多示例
   - 调整 temperature 参数

### 调试技巧

- 使用预览功能测试配置
- 查看详细的错误日志
- 逐步验证每个组件
- 使用简单的测试用例

## 贡献指南

欢迎贡献新的 Skills！请遵循以下步骤：

1. Fork 仓库
2. 创建新的 Skill 目录
3. 编写 Skill 配置和代码
4. 添加测试用例
5. 更新文档
6. 提交 Pull Request

## 许可证

Skills 可以使用以下许可证：

- MIT: 最宽松的开源许可证
- Apache-2.0: 允许商业使用
- GPL-3.0: 强制开源衍生作品
- BSD-3-Clause: 简单的许可证
- Proprietary: 专有软件

## 支持

如有问题，请：

- 查看文档和示例
- 搜索已知问题
- 提交 Issue
- 联系支持团队

---

*最后更新：2026-01-22*
