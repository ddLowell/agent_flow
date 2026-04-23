"""Parallel Node - Parallel execution"""

from typing import Dict, Any, List, Optional
import asyncio
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("parallel")
class ParallelNode(BaseNode):
    """并行节点 - 并行执行多个节点"""

    node_type = NodeType.PARALLEL

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.parallel_steps = config.get("parallel_steps", [])
        self.max_concurrency = config.get("max_concurrency", 5)
        self.error_handling = config.get("error_handling", "continue")  # continue, stop, fail_fast

    def validate_config(self) -> bool:
        """验证配置"""
        if not self.parallel_steps:
            return False

        for step in self.parallel_steps:
            if "id" not in step:
                return False

        if self.max_concurrency <= 0:
            return False

        return True

    def get_required_inputs(self) -> List[str]:
        """获取必需的输入字段"""
        # 并行节点不需要特定的输入字段
        return []

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        并行执行多个节点

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        import time
        start_time = time.time()

        try:
            # 创建所有节点的任务
            tasks = []
            for step in self.parallel_steps:
                task = self._execute_parallel_step(step, inputs, context)
                tasks.append(task)

            # 控制并发数
            if self.max_concurrency > 0:
                results = await self._execute_with_concurrency(tasks, self.max_concurrency)
            else:
                results = await asyncio.gather(*tasks, return_exceptions=True)

            # 处理结果
            successful_results = []
            errors = []

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    errors.append({
                        "step_id": self.parallel_steps[i]["id"],
                        "error": str(result)
                    })

                    if self.error_handling == "fail_fast":
                        raise result
                elif isinstance(result, NodeResult):
                    if result.success:
                        successful_results.append({
                            "step_id": self.parallel_steps[i]["id"],
                            "result": result.model_dump()
                        })
                    else:
                        errors.append({
                            "step_id": self.parallel_steps[i]["id"],
                            "error": result.error
                        })

                        if self.error_handling == "stop":
                            break

            execution_time = time.time() - start_time

            # 如果有任何错误且错误处理策略是 fail_fast
            if errors and self.error_handling == "fail_fast":
                return NodeResult(
                    success=False,
                    error=f"Parallel execution failed with {len(errors)} errors",
                    execution_time=execution_time,
                    metadata={
                        "total_steps": len(self.parallel_steps),
                        "successful": len(successful_results),
                        "errors": len(errors)
                    }
                )

            return NodeResult(
                success=len(errors) == 0,
                outputs={
                    "results": successful_results,
                    "errors": errors
                },
                execution_time=execution_time,
                metadata={
                    "total_steps": len(self.parallel_steps),
                    "successful": len(successful_results),
                    "errors": len(errors)
                }
            )

        except Exception as e:
            execution_time = time.time() - start_time

            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time
            )

    async def _execute_parallel_step(
        self,
        step: Dict[str, Any],
        inputs: Dict[str, Any],
        context: Any
    ) -> NodeResult:
        """
        执行单个并行步骤

        Args:
            step: 步骤配置
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        # 注意：这里只是占位实现
        # 实际实现需要从 NodeRegistry 创建节点并执行

        # 模拟执行
        await asyncio.sleep(0.1)

        return NodeResult(
            success=True,
            outputs={"step_id": step["id"]},
            metadata={"step_name": step.get("name", "")}
        )

    async def _execute_with_concurrency(
        self,
        tasks: List,
        max_concurrency: int
    ) -> List[Any]:
        """
        控制并发执行

        Args:
            tasks: 任务列表
            max_concurrency: 最大并发数

        Returns:
            List[Any]: 执行结果列表
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def limited_task(task):
            async with semaphore:
                return await task

        return await asyncio.gather(*(limited_task(task) for task in tasks))