"""
示例 MCP Server - 提供天气查询工具

这是一个简单的 MCP Server 实现，演示如何创建和注册工具。
"""

import asyncio
import json
from typing import Dict, Any, Optional
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.types import (
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)
import httpx


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
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """
    处理工具调用
    """
    if name == "get_weather":
        return await get_current_weather(arguments)
    elif name == "get_forecast":
        return await get_weather_forecast(arguments)
    else:
        raise ValueError(f"Unknown tool: {name}")


async def get_current_weather(arguments: Dict[str, Any]) -> list[TextContent]:
    """
    获取当前天气

    Args:
        arguments: 包含 city 和 unit 的参数

    Returns:
        list[TextContent]: 天气信息
    """
    city = arguments.get("city", "Unknown")
    unit = arguments.get("unit", "celsius")

    try:
        # 模拟天气 API 调用
        # 实际使用时可以接入真实的天气 API
        weather_data = await fetch_weather_data(city, unit)

        result = f"""
Weather Report for {city}
{'=' * 40}

Current Conditions:
- Temperature: {weather_data['temperature']}°{unit[0].upper()}
- Humidity: {weather_data['humidity']}%
- Condition: {weather_data['condition']}
- Wind: {weather_data['wind_speed']} km/h

Last Updated: {weather_data['timestamp']}
"""
        return [TextContent(type="text", text=result)]

    except Exception as e:
        return [TextContent(type="text", text=f"Error fetching weather: {str(e)}")]


async def get_weather_forecast(arguments: Dict[str, Any]) -> list[TextContent]:
    """
    获取天气预报

    Args:
        arguments: 包含 city 和 unit 的参数

    Returns:
        list[TextContent]: 天气预报
    """
    city = arguments.get("city", "Unknown")
    unit = arguments.get("unit", "celsius")

    try:
        # 模拟天气预报 API 调用
        forecast_data = await fetch_forecast_data(city, unit)

        result = f"""
3-Day Weather Forecast for {city}
{'=' * 50}

Day 1 - {forecast_data[0]['date']}:
- High: {forecast_data[0]['high']}°{unit[0].upper()}
- Low: {forecast_data[0]['low']}°{unit[0].upper()}
- Condition: {forecast_data[0]['condition']}

Day 2 - {forecast_data[1]['date']}:
- High: {forecast_data[1]['high']}°{unit[0].upper()}
- Low: {forecast_data[1]['low']}°{unit[0].upper()}
- Condition: {forecast_data[1]['condition']}

Day 3 - {forecast_data[2]['date']}:
- High: {forecast_data[2]['high']}°{unit[0].upper()}
- Low: {forecast_data[2]['low']}°{unit[0].upper()}
- Condition: {forecast_data[2]['condition']}
"""
        return [TextContent(type="text", text=result)]

    except Exception as e:
        return [TextContent(type="text", text=f"Error fetching forecast: {str(e)}")]


async def fetch_weather_data(city: str, unit: str) -> Dict[str, Any]:
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


async def fetch_forecast_data(city: str, unit: str) -> list[Dict[str, Any]]:
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
    from mcp.server.stdio import stdio_server

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