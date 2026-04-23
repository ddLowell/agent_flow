# Weather MCP Server

这是一个示例 MCP Server，提供天气查询和预报功能。

## 功能

- **get_weather**: 获取指定城市的当前天气
- **get_forecast**: 获取指定城市未来 3 天的天气预报

## 安装依赖

```bash
pip install mcp httpx
```

## 运行 MCP Server

```bash
python weather_server.py
```

## 使用方法

### 方法 1: 作为独立 MCP Server 运行

```bash
python weather_server.py
```

### 方法 2: 在 AgentFlow 中使用

在 FlowSpec YAML 中配置 MCP Server 节点：

```yaml
- id: get-weather
  type: mcp_server
  name: "Get Weather"
  config:
    server_url: "stdio:/path/to/weather_server.py"
    tool_name: "get_weather"
  inputs:
    city: "${inputs.city}"
    unit: "${inputs.unit | 'celsius'}"
```

## 工具定义

### get_weather

**描述**: 获取指定城市的当前天气信息

**参数**:
- `city` (必需): 城市名称（如：Beijing, Shanghai, New York）
- `unit` (可选): 温度单位，默认为 "celsius"
  - `celsius`: 摄氏度
  - `fahrenheit`: 华氏度

**示例**:
```python
{
  "city": "Beijing",
  "unit": "celsius"
}
```

**输出示例**:
```
Weather Report for Beijing
========================================

Current Conditions:
- Temperature: 25.0°C
- Humidity: 65%
- Condition: Sunny
- Wind: 12 km/h

Last Updated: 2026-04-22 18:00:00
```

### get_forecast

**描述**: 获取指定城市未来 3 天的天气预报

**参数**:
- `city` (必需): 城市名称
- `unit` (可选): 温度单位，默认为 "celsius"

**示例**:
```python
{
  "city": "Shanghai",
  "unit": "celsius"
}
```

## 注意事项

当前实现使用模拟数据，实际使用时需要：

1. 注册天气 API（如 OpenWeatherMap, WeatherAPI 等）
2. 替换 `fetch_weather_data` 和 `fetch_forecast_data` 函数
3. 添加 API 密钥管理

## 扩展建议

可以添加更多功能：
- 空气质量指数（AQI）
- 降水概率
- 风向和风力级别
- 日出日落时间
- 历史天气数据查询