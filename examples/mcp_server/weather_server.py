"""
示例 MCP Server - 提供天气查询工具

这是一个简单的 MCP Server 实现，演示如何创建和注册工具。
"""

import asyncio
from typing import Any

try:
    from mcp.server import Server
    from mcp.server.models import InitializationOptions
    from mcp.types import Tool, TextContent
    from mcp.server.stdio import stdio_server
except ImportError:
    # MCP SDK 未安装时提供 mock 实现
    class Server:
        def __init__(self, name: str, version: str):
            self.name = name
            self.version = version
            self.NOTIFICATION_OPTIONS = {}

        def list_tools(self):
            def decorator(func):
                return func
            return decorator

        def call_tool(self):
            def decorator(func):
                return func
            return decorator

        def get_capabilities(self, **kwargs):
            return {}

        async def run(self, read_stream, write_stream, options):
            pass

    class InitializationOptions:
        def __init__(self, server_name: str, server_version: str, capabilities: dict):
            self.server_name = server_name
            self.server_version = server_version
            self.capabilities = capabilities

    class Tool:
        def __init__(self, name: str, description: str, inputSchema: dict):
            self.name = name
            self.description = description
            self.inputSchema = inputSchema

    class TextContent:
        def __init__(self, type: str, text: str):
            self.type = type
            self.text = text

    class stdio_server:
        async def __aenter__(self):
            return (None, None)
        async def __aexit__(self, *args):
            pass


# 创建 MCP Server 实例
server = Server("weather-server", "1.0.0")


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """
    列出所有可用的工具
    """
    return [
        Tool(
            name="get_weather",
            description="Get current weather information for a specific city",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name (e.g., Beijing, Shanghai, New York)"
                    },
                    "unit": {
                        "type": "string",
                        "description": "Temperature unit (celsius or fahrenheit)",
                        "enum": ["celsius", "fahrenheit"],
                        "default": "celsius"
                    }
                },
                "required": ["city"]
            }
        ),
        Tool(
            name="get_forecast",
            description="Get weather forecast for the next 3 days",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name"
                    },
                    "unit": {
                        "type": "string",
                        "description": "Temperature unit",
                        "enum": ["celsius", "fahrenheit"],
                        "default": "celsius"
                    }
                },
                "required": ["city"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """
    处理工具调用
    """
    if name == "get_weather":
        return await get_current_weather(arguments)
    elif name == "get_forecast":
        return await get_weather_forecast(arguments)
    else:
        raise ValueError(f"Unknown tool: {name}")


async def get_current_weather(arguments: dict[str, Any]) -> list[TextContent]:
    """
    获取当前天气

    Args:
        arguments: 包含 city 和 unit 的参数

    Returns:
        list[TextContent]: 天气信息
    """
    city: str = arguments.get("city", "Unknown")
    unit: str = arguments.get("unit", "celsius")

    try:
        # 模拟天气 API 调用
        # 实际使用时可以接入真实的天气 API
        weather_data = await fetch_weather_data(city, unit)

        unit_symbol: str = unit[0].upper() if isinstance(unit, str) else 'C'
        result = f"""
Weather Report for {city}
{'=' * 40}

Current Conditions:
- Temperature: {weather_data['temperature']}°{unit_symbol}
- Humidity: {weather_data['humidity']}%
- Condition: {weather_data['condition']}
- Wind: {weather_data['wind_speed']} km/h

Last Updated: {weather_data['timestamp']}
"""
        return [TextContent(type="text", text=result)]

    except Exception as e:
        return [TextContent(type="text", text=f"Error fetching weather: {str(e)}")]


async def get_weather_forecast(arguments: dict[str, Any]) -> list[TextContent]:
    """
    获取天气预报

    Args:
        arguments: 包含 city 和 unit 的参数

    Returns:
        list[TextContent]: 天气预报
    """
    city: str = arguments.get("city", "Unknown")
    unit: str = arguments.get("unit", "celsius")

    try:
        # 模拟天气预报 API 调用
        forecast_data = await fetch_forecast_data(city, unit)

        unit_symbol: str = unit[0].upper() if isinstance(unit, str) else 'C'
        result = f"""
3-Day Weather Forecast for {city}
{'=' * 50}

Day 1 - {forecast_data[0]['date']}:
- High: {forecast_data[0]['high']}°{unit_symbol}
- Low: {forecast_data[0]['low']}°{unit_symbol}
- Condition: {forecast_data[0]['condition']}

Day 2 - {forecast_data[1]['date']}:
- High: {forecast_data[1]['high']}°{unit_symbol}
- Low: {forecast_data[1]['low']}°{unit_symbol}
- Condition: {forecast_data[1]['condition']}

Day 3 - {forecast_data[2]['date']}:
- High: {forecast_data[2]['high']}°{unit_symbol}
- Low: {forecast_data[2]['low']}°{unit_symbol}
- Condition: {forecast_data[2]['condition']}
"""
        return [TextContent(type="text", text=result)]

    except Exception as e:
        return [TextContent(type="text", text=f"Error fetching forecast: {str(e)}")]


async def fetch_weather_data(city: str, unit: str) -> dict[str, Any]:
    """
    获取天气数据（模拟）

    Args:
        city: 城市名称
        unit: 温度单位

    Returns:
        Dict: 天气数据
    """
    # 模拟数据 - 实际使用时接入真实 API
    from datetime import datetime

    # 根据城市名称生成伪随机数据
    import hashlib
    city_hash = int(hashlib.md5(city.encode()).hexdigest(), 16)

    base_temp = 20 + (city_hash % 15)
    if unit == "fahrenheit":
        base_temp = base_temp * 9 / 5 + 32

    return {
        "temperature": round(base_temp, 1),
        "humidity": 50 + (city_hash % 40),
        "condition": ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][city_hash % 4],
        "wind_speed": 5 + (city_hash % 20),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


async def fetch_forecast_data(city: str, unit: str) -> list[dict[str, Any]]:
    """
    获取天气预报数据（模拟）

    Args:
        city: 城市名称
        unit: 温度单位

    Returns:
        list[Dict]: 3 天的预报数据
    """
    from datetime import datetime, timedelta
    import hashlib

    city_hash = int(hashlib.md5(city.encode()).hexdigest(), 16)
    base_temp = 20 + (city_hash % 15)

    if unit == "fahrenheit":
        base_temp = base_temp * 9 / 5 + 32

    forecast = []
    for i in range(3):
        date = (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d")
        day_hash = (city_hash + i) % 100

        forecast.append({
            "date": date,
            "high": round(base_temp + (day_hash % 10), 1),
            "low": round(base_temp - (day_hash % 10), 1),
            "condition": ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][day_hash % 4]
        })

    return forecast


async def main():
    """启动 MCP Server"""
    # 从 stdio 运行服务器（标准 MCP 传输方式）
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="weather-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=server.NOTIFICATION_OPTIONS,
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())