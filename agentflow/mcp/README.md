# AgentFlow MCP Server 规范

## 概述

MCP (Model Context Protocol) 是 AgentFlow 与外部工具和服务交互的标准协议。通过 MCP Server，AgentFlow 可以调用各种外部能力，如天气查询、搜索引擎、数据库操作等。

## MCP Server 格式规范

### 1. 基本结构

每个 MCP Server 必须遵循以下 JSON 格式：

```json
{
  "mcp_version": "1.0.0",
  "server": {
    "name": "server-name",
    "version": "1.0.0",
    "description": "Server description",
    "author": "Author Name",
    "license": "MIT",
    "homepage": "https://example.com",
    "repository": "https://github.com/example/mcp-server"
  },
  "transport": {
    "type": "stdio|http|sse",
    "config": {
      // 传输层特定配置
    }
  },
  "tools": [
    {
      "name": "tool-name",
      "description": "Tool description",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Parameter description"
          }
        },
        "required": ["param1"]
      },
      "returns": {
        "type": "object",
        "description": "Return value description"
      }
    }
  ],
  "resources": [
    {
      "uri": "resource://example",
      "name": "Resource Name",
      "description": "Resource description",
      "mimeType": "application/json"
    }
  ]
}
```

### 2. 传输类型

#### 2.1 stdio 传输

通过标准输入输出进行通信，适合本地脚本。

```json
{
  "transport": {
    "type": "stdio",
    "config": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "API_KEY": "${ENV:API_KEY}"
      },
      "cwd": "/path/to/working/dir"
    }
  }
}
```

#### 2.2 HTTP 传输

通过 HTTP API 进行通信，适合远程服务。

```json
{
  "transport": {
    "type": "http",
    "config": {
      "baseUrl": "https://api.example.com",
      "headers": {
        "Authorization": "Bearer ${ENV:API_TOKEN}"
      },
      "timeout": 30000
    }
  }
}
```

#### 2.3 SSE 传输

通过 Server-Sent Events 进行实时通信。

```json
{
  "transport": {
    "type": "sse",
    "config": {
      "endpoint": "https://api.example.com/events",
      "headers": {
        "Authorization": "Bearer ${ENV:API_TOKEN}"
      },
      "reconnect": true
    }
  }
}
```

### 3. 工具定义

工具是 MCP Server 提供的可调用功能。

```json
{
  "tools": [
    {
      "name": "search",
      "description": "Search the web for information",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query string"
          },
          "limit": {
            "type": "integer",
            "description": "Maximum number of results",
            "default": 10,
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": ["query"]
      },
      "returns": {
        "type": "object",
        "properties": {
          "results": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {"type": "string"},
                "url": {"type": "string"},
                "snippet": {"type": "string"}
              }
            }
          }
        }
      }
    }
  ]
}
```

### 4. 参数类型支持

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | `"hello"` |
| `integer` | 整数 | `42` |
| `number` | 浮点数 | `3.14` |
| `boolean` | 布尔值 | `true` |
| `array` | 数组 | `["a", "b"]` |
| `object` | 对象 | `{"key": "value"}` |
| `enum` | 枚举值 | `"celsius" \| "fahrenheit"` |

### 5. 资源定义

资源是 MCP Server 可以提供的只读数据。

```json
{
  "resources": [
    {
      "uri": "weather://current",
      "name": "Current Weather",
      "description": "Get current weather data",
      "mimeType": "application/json",
      "schema": {
        "type": "object",
        "properties": {
          "temperature": {"type": "number"},
          "humidity": {"type": "number"},
          "condition": {"type": "string"}
        }
      }
    }
  ]
}
```

## MCP Server 实现示例

### Python 实现

```python
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("example-server", "1.0.0")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="echo",
            description="Echo back the input message",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Message to echo"
                    }
                },
                "required": ["message"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "echo":
        message = arguments.get("message", "")
        return [TextContent(type="text", text=f"Echo: {message}")]
```

### Node.js 实现

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "echo",
      description: "Echo back the input message",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Message to echo"
          }
        },
        required: ["message"]
      }
    }]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "echo") {
    const message = request.params.arguments?.message || "";
    return {
      content: [{
        type: "text",
        text: `Echo: ${message}`
      }]
    };
  }
});
```

## 在 FlowSpec 中使用 MCP Server

```yaml
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: weather-flow
spec:
  stages:
    - id: data-collection
      name: "数据收集"
      steps:
        - id: get-weather
          type: mcp_server
          name: "获取天气"
          config:
            server_ref: "weather-server"
            tool_name: "get_weather"
          inputs:
            city: "${inputs.city}"
            unit: "${inputs.unit | 'celsius'}"
          outputs:
            temperature: "${result.temperature}"
            condition: "${result.condition}"
```

## 安全考虑

1. **环境变量**: 敏感信息应通过 `${ENV:VAR_NAME}` 语法注入
2. **权限控制**: 每个 MCP Server 应声明所需的权限范围
3. **超时设置**: 默认工具调用超时为 30 秒，可配置
4. **输入验证**: 所有输入参数必须符合 JSON Schema 定义

## 调试工具

AgentFlow CLI 提供 MCP Server 调试命令：

```bash
# 验证 MCP Server 配置
agentflow mcp validate ./server-config.json

# 测试工具调用
agentflow mcp test --server weather-server --tool get_weather --args '{"city": "Beijing"}'

# 列出可用工具
agentflow mcp tools --server weather-server
```
