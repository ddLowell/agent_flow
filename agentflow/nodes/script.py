"""Script Node - Execute custom scripts"""

import asyncio
import time
from typing import Dict, Any
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("script")
class ScriptNode(BaseNode):
    """脚本节点 - 支持多种语言的自定义脚本执行"""

    node_type = NodeType.SCRIPT

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.language = self.config.get("language", "python")
        self.code = self.config.get("code", "")
        self.timeout = self.config.get("timeout", 300)  # 默认 5 分钟

    def validate_config(self) -> bool:
        """验证配置"""
        if not self.language:
            return False

        if self.language not in ["python", "javascript", "bash", "shell"]:
            return False

        if not self.code or not self.code.strip():
            return False

        return True

    def get_required_inputs(self) -> list[str]:
        """获取必需的输入字段"""
        # Script 节点的输入由代码决定，这里返回空列表
        # 实际使用时可以从 inputs 配置中提取
        return []

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行脚本

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        start_time = time.time()

        try:
            # 根据语言选择执行器
            if self.language == "python":
                result = await self._execute_python(inputs, context)
            elif self.language == "javascript":
                result = await self._execute_javascript(inputs, context)
            elif self.language in ["bash", "shell"]:
                result = await self._execute_shell(inputs, context)
            else:
                raise ValueError(f"Unsupported language: {self.language}")

            execution_time = time.time() - start_time

            return NodeResult(
                success=True,
                outputs={"result": result},
                execution_time=execution_time,
                metadata={"language": self.language}
            )

        except Exception as e:
            execution_time = time.time() - start_time

            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                metadata={"language": self.language}
            )

    async def _execute_python(self, inputs: Dict[str, Any], context: Any) -> Any:
        """执行 Python 脚本"""
        # 创建执行环境
        namespace = {
            "inputs": inputs,
            "context": context,
            "__builtins__": {
                "print": print,
                "len": len,
                "str": str,
                "int": int,
                "float": float,
                "bool": bool,
                "list": list,
                "dict": dict,
                "tuple": tuple,
                "set": set,
            }
        }

        # 执行代码
        exec(self.code, namespace)

        # 返回结果（假设代码定义了 result 变量）
        return namespace.get("result")

    async def _execute_javascript(self, inputs: Dict[str, Any], context: Any) -> Any:
        """执行 JavaScript 脚本"""
        # 简单实现，实际可以使用 Node.js 或 PyExecJS
        raise NotImplementedError("JavaScript execution not yet implemented")

    async def _execute_shell(self, inputs: Dict[str, Any], context: Any) -> Any:
        """执行 Shell 脚本"""
        process = await asyncio.create_subprocess_shell(
            self.code,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=self.timeout
        )

        if process.returncode != 0:
            raise RuntimeError(f"Script failed with code {process.returncode}: {stderr.decode()}")

        return stdout.decode().strip()