"""Loop Node - Iterative execution"""

from typing import Dict, Any, List, Optional
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("loop")
class LoopNode(BaseNode):
    """循环节点 - 重复执行节点或阶段"""

    node_type = NodeType.LOOP

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.loop_type = config.get("loop_type", "fixed")  # fixed, while, for
        self.max_iterations = config.get("max_iterations", 10)
        self.target_step = config.get("target_step", "")
        self.break_condition = config.get("break_condition", "")
        self.continue_condition = config.get("continue_condition", "")

    def validate_config(self) -> bool:
        """验证配置"""
        if self.loop_type not in ["fixed", "while", "for"]:
            return False

        if self.max_iterations <= 0 or self.max_iterations > 100:
            return False

        if not self.target_step:
            return False

        return True

    def get_required_inputs(self) -> list[str]:
        """获取必需的输入字段"""
        # 循环节点不需要特定的输入字段
        return []

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行循环

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        import time
        start_time = time.time()

        try:
            results = []
            iteration_count = 0

            while iteration_count < self.max_iterations:
                # 检查中断条件
                if self.break_condition and self._evaluate_condition(
                    self.break_condition,
                    inputs,
                    context,
                    results
                ):
                    break

                # 检查继续条件
                if self.continue_condition and not self._evaluate_condition(
                    self.continue_condition,
                    inputs,
                    context,
                    results
                ):
                    break

                # 执行目标节点
                # 注意：这里只是定义循环逻辑，实际执行由 Pipeline Engine 处理
                # 节点只返回循环配置信息

                iteration_count += 1

            execution_time = time.time() - start_time

            return NodeResult(
                success=True,
                outputs={
                    "iterations": iteration_count,
                    "results": results
                },
                execution_time=execution_time,
                metadata={
                    "loop_type": self.loop_type,
                    "target_step": self.target_step,
                    "max_iterations": self.max_iterations
                }
            )

        except Exception as e:
            execution_time = time.time() - start_time

            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time
            )

    def _evaluate_condition(
        self,
        condition: str,
        inputs: Dict[str, Any],
        context: Any,
        results: List[Any]
    ) -> bool:
        """
        评估条件表达式

        Args:
            condition: 条件表达式
            inputs: 输入数据
            context: 执行上下文
            results: 迭代结果列表

        Returns:
            bool: 条件是否满足
        """
        # 简单实现
        safe_globals = {
            "__builtins__": {
                "len": len,
                "any": any,
                "all": all,
                "True": True,
                "False": False,
            }
        }

        # 替换变量
        condition = self._replace_variables(condition, inputs, results)

        try:
            return eval(condition, safe_globals, {})
        except Exception:
            return False

    def _replace_variables(
        self,
        expression: str,
        inputs: Dict[str, Any],
        results: List[Any]
    ) -> str:
        """替换变量引用"""
        import re

        # 替换 ${inputs.xxx}
        pattern = r'\$\{inputs\.(\w+)\}'

        def replace_input(match):
            key = match.group(1)
            value = inputs.get(key, None)
            if isinstance(value, str):
                return f'"{value}"'
            elif value is None:
                return "None"
            else:
                return str(value)

        expression = re.sub(pattern, replace_input, expression)

        # 替换 ${results}
        expression = expression.replace("${results}", str(results))
        expression = expression.replace("${len(results)}", str(len(results)))

        return expression