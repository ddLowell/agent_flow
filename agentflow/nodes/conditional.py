"""Conditional Node - Branching logic"""

from typing import Dict, Any, List, Optional
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("conditional")
class ConditionalNode(BaseNode):
    """条件节点 - 根据条件选择不同的执行路径"""

    node_type = NodeType.CONDITIONAL

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.condition = config.get("condition", "")
        self.branches = config.get("branches", [])
        self.default_branch = config.get("default_branch")

    def validate_config(self) -> bool:
        """验证配置"""
        if not self.condition:
            return False

        if not self.branches:
            return False

        for branch in self.branches:
            if "id" not in branch:
                return False
            if "condition" not in branch:
                return False

        return True

    def get_required_inputs(self) -> list[str]:
        """获取必需的输入字段"""
        # 条件节点不需要特定的输入字段
        return []

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行条件判断

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        import time
        start_time = time.time()

        try:
            # 评估条件
            condition_result = self._evaluate_condition(self.condition, inputs, context)

            # 查找匹配的分支
            selected_branch = None
            for branch in self.branches:
                branch_condition = branch.get("condition", "")
                if self._evaluate_condition(branch_condition, inputs, context):
                    selected_branch = branch
                    break

            # 如果没有匹配的分支，使用默认分支
            if not selected_branch and self.default_branch:
                for branch in self.branches:
                    if branch.get("id") == self.default_branch:
                        selected_branch = branch
                        break

            if not selected_branch:
                raise ValueError("No matching branch found and no default branch")

            execution_time = time.time() - start_time

            return NodeResult(
                success=True,
                outputs={
                    "branch_id": selected_branch.get("id"),
                    "branch_name": selected_branch.get("name"),
                    "target_stage": selected_branch.get("target")
                },
                execution_time=execution_time,
                metadata={
                    "condition_evaluated": self.condition,
                    "condition_result": condition_result,
                    "selected_branch": selected_branch.get("id")
                }
            )

        except Exception as e:
            execution_time = time.time() - start_time

            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time
            )

    def _evaluate_condition(self, condition: str, inputs: Dict[str, Any], context: Any) -> bool:
        """
        评估条件表达式

        Args:
            condition: 条件表达式
            inputs: 输入数据
            context: 执行上下文

        Returns:
            bool: 条件是否满足
        """
        # 简单实现：支持 Python 表达式
        # 注意：生产环境应该使用更安全的表达式评估器

        # 替换变量引用
        safe_globals = {
            "__builtins__": {
                "True": True,
                "False": False,
                "and": lambda a, b: a and b,
                "or": lambda a, b: a or b,
                "not": lambda a: not a,
                "==": lambda a, b: a == b,
                "!": lambda a: not a,
                "!=": lambda a, b: a != b,
                ">": lambda a, b: a > b,
                "<": lambda a, b: a < b,
                ">=": lambda a, b: a >= b,
                "<=": lambda a, b: a <= b,
            }
        }

        # 解析变量引用（例如 ${inputs.name}）
        condition = self._replace_variables(condition, inputs)

        # 评估表达式
        try:
            return eval(condition, safe_globals, {})
        except Exception:
            return False

    def _replace_variables(self, expression: str, inputs: Dict[str, Any]) -> str:
        """
        替换变量引用

        Args:
            expression: 表达式字符串
            inputs: 输入数据

        Returns:
            str: 替换后的表达式
        """
        import re

        # 替换 ${inputs.xxx} 为实际值
        pattern = r'\$\{inputs\.(\w+)\}'

        def replace_match(match):
            key = match.group(1)
            value = inputs.get(key, None)
            if isinstance(value, str):
                return f'"{value}"'
            elif value is None:
                return "None"
            else:
                return str(value)

        return re.sub(pattern, replace_match, expression)