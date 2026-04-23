"""MCP Server Node - Connect to MCP servers"""

from typing import Dict, Any, Optional
import httpx
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("mcp_server")
class MCPServerNode(BaseNode):
    """MCP Server 节点 - 调用 MCP Server 提供的工具"""

    node_type = NodeType.MCP_SERVER

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.server_url = self.config.get("server_url", "")
        self.tool_name = self.config.get("tool_name", "")
        self.timeout = self.config.get("timeout", 30)

    def validate_config(self) -> bool:
        """验证配置"""
        if not self.server_url:
            return False

        if not self.tool_name:
            return False

        return True

    def get_required_inputs(self) -> list[str]:
        """获取必需的输入字段"""
        # MCP 节点的输入由工具定义，这里返回空列表
        # 实际可以从 MCP Server 获取工具定义
        return []

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行 MCP 工具调用

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        import time
        start_time = time.time()

        try:
            # 准备请求数据
            request_data = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": self.tool_name,
                    "arguments": inputs
                }
            }

            # 调用 MCP Server
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.server_url,
                    json=request_data,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                result_data = response.json()

            # 处理响应
            if "error" in result_data:
                raise Exception(f"MCP Server error: {result_data['error']}")

            result = result_data.get("result", {})
            execution_time = time.time() - start_time

            return NodeResult(
                success=True,
                outputs=result,
                execution_time=execution_time,
                metadata={
                    "server_url": self.server_url,
                    "tool_name": self.tool_name
                }
            )

        except httpx.TimeoutException:
            execution_time = time.time() - start_time
            return NodeResult(
                success=False,
                error=f"MCP Server timeout after {self.timeout}s",
                execution_time=execution_time
            )

        except Exception as e:
            execution_time = time.time() - start_time
            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time
            )