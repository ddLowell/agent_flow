"""Pipeline Engine - Execute FlowSpec workflows"""

from typing import Dict, Any, Optional, List, AsyncIterator
from datetime import datetime
import asyncio
from enum import Enum

from agentflow.core.flow_spec import FlowSpec, Stage, NodeConfig
from agentflow.core.context import Context, VariableScope, FilePersistenceBackend
from agentflow.nodes import NodeRegistry, BaseNode
from agentflow.nodes.base import NodeResult


class ExecutionStatus(str, Enum):
    """执行状态"""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PipelineEngine:
    """流程执行引擎"""

    def __init__(
        self,
        flow_spec: FlowSpec,
        run_id: Optional[str] = None,
        enable_persistence: bool = True,
        distributed: bool = False
    ):
        """
        初始化流程引擎

        Args:
            flow_spec: 流程规范
            run_id: 运行 ID（如果为 None，自动生成）
            enable_persistence: 是否启用持久化
            distributed: 是否启用分布式执行
        """
        self.flow_spec = flow_spec
        self.run_id = run_id or self._generate_run_id()
        self.enable_persistence = enable_persistence
        self.distributed = distributed

        # 创建上下文
        self.context = Context(self.run_id, self.flow_spec.metadata.name)

        # 启用持久化
        if enable_persistence:
            backend = FilePersistenceBackend()
            self.context.enable_persistence(backend)

        # 执行状态
        self.status = ExecutionStatus.PENDING
        self._pause_event = asyncio.Event()
        self._stop_event = asyncio.Event()

        # 结果收集
        self.execution_results: Dict[str, NodeResult] = {}

    @staticmethod
    def _generate_run_id() -> str:
        """生成运行 ID"""
        import uuid
        return f"run_{uuid.uuid4().hex[:12]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    async def execute(
        self,
        inputs: Optional[Dict[str, Any]] = None,
        stream_logs: bool = False
    ) -> Dict[str, Any]:
        """
        执行流程

        Args:
            inputs: 输入参数
            stream_logs: 是否流式输出日志

        Returns:
            Dict: 执行结果
        """
        # 初始化输入
        if inputs:
            for key, value in inputs.items():
                self.context.set_variable(key, value, VariableScope.GLOBAL, source="inputs")

        # 切换到运行状态
        self.status = ExecutionStatus.RUNNING
        self.context.set_variable("_status", "running", VariableScope.GLOBAL)

        try:
            # 获取所有阶段
            stages = self.flow_spec.get_stages()

            # 执行每个阶段
            for stage in stages:
                await self._execute_stage(stage, stream_logs)

                # 检查是否暂停
                if self._stop_event.is_set():
                    raise RuntimeError("Execution stopped")

            # 完成
            self.status = ExecutionStatus.COMPLETED
            self.context.complete()

            return self._build_final_result()

        except Exception as e:
            self.status = ExecutionStatus.FAILED
            self.context.fail(str(e))
            raise

    async def _execute_stage(
        self,
        stage: Stage,
        stream_logs: bool = False
    ) -> None:
        """
        执行阶段

        Args:
            stage: 阶段配置
            stream_logs: 是否流式输出日志
        """
        self.context.set_stage(stage.id)
        self.context.log("info", f"Starting stage: {stage.name or stage.id}")

        # 创建阶段级变量作用域
        self.context.clear_scope(VariableScope.STAGE)

        # 构建执行顺序（基于依赖关系）
        execution_order = self._build_execution_order(stage.steps)

        # 执行节点
        for step_config in execution_order:
            await self._execute_node(step_config, stream_logs)

        self.context.log("info", f"Completed stage: {stage.name or stage.id}")

    async def _execute_node(
        self,
        node_config: NodeConfig,
        stream_logs: bool = False
    ) -> None:
        """
        执行节点

        Args:
            node_config: 节点配置
            stream_logs: 是否流式输出日志
        """
        self.context.set_node(node_config.id)
        self.context.log("info", f"Executing node: {node_config.name or node_config.id}")

        try:
            # 创建节点实例
            node = NodeRegistry.create_node(node_config.type, node_config.model_dump())

            # 准备输入
            node_inputs = self._prepare_inputs(node_config.inputs)

            # 执行节点
            result = await node.execute(node_inputs, self.context)

            # 存储结果
            self.execution_results[node_config.id] = result

            # 更新上下文变量
            if result.success:
                self._update_context_outputs(node_config.outputs, result.outputs)

                self.context.log(
                    "info",
                    f"Node {node_config.name or node_config.id} completed",
                    execution_time=result.execution_time,
                    cost=result.cost
                )

                # 流式输出日志
                if stream_logs:
                    await self._stream_log(result)
            else:
                self.context.log(
                    "error",
                    f"Node {node_config.name or node_config.id} failed: {result.error}"
                )
                raise RuntimeError(f"Node execution failed: {result.error}")

        except Exception as e:
            self.context.log(
                "error",
                f"Node {node_config.name or node_config.id} error: {str(e)}"
            )
            raise

    def _build_execution_order(self, steps: List[NodeConfig]) -> List[NodeConfig]:
        """
        构建执行顺序（基于依赖关系的拓扑排序）

        Args:
            steps: 节点列表

        Returns:
            List[NodeConfig]: 排序后的节点列表
        """
        # 简单实现：按 depends_on 排序
        # 实际实现应该进行完整的拓扑排序

        from collections import defaultdict, deque

        # 构建依赖图
        graph = defaultdict(list)
        in_degree = {}

        for step in steps:
            in_degree[step.id] = 0

        for step in steps:
            for dep in step.depends_on:
                graph[dep].append(step.id)
                in_degree[step.id] += 1

        # 拓扑排序
        queue = deque([step_id for step_id, degree in in_degree.items() if degree == 0])
        order = []

        while queue:
            current = queue.popleft()
            order.append(current)

            for neighbor in graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # 构建结果列表
        step_map = {step.id: step for step in steps}
        return [step_map[step_id] for step_id in order if step_id in step_map]

    def _prepare_inputs(self, inputs_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        准备节点输入（解析变量引用）

        Args:
            inputs_config: 输入配置

        Returns:
            Dict: 解析后的输入
        """
        prepared = {}

        for key, value_expr in inputs_config.items():
            # 解析变量引用（如 ${inputs.name}）
            if isinstance(value_expr, str) and value_expr.startswith("${"):
                prepared[key] = self._resolve_variable_expression(value_expr)
            else:
                prepared[key] = value_expr

        return prepared

    def _resolve_variable_expression(self, expr: str) -> Any:
        """
        解析变量表达式

        Args:
            expr: 变量表达式（如 ${inputs.name}）

        Returns:
            Any: 变量值
        """
        import re

        # 移除 ${ }
        inner = expr[2:-1]

        # 简单解析：inputs.name 或 stages.stage_id.steps.step_id.outputs.xxx
        parts = inner.split(".")

        if parts[0] == "inputs":
            # 全局输入变量
            var_name = parts[1]
            return self.context.get_variable(var_name)

        elif parts[0] == "stages":
            # 阶段步骤输出
            stage_id = parts[1]
            step_id = parts[3]
            output_key = parts[5]

            # 从执行结果中获取
            step_result = self.execution_results.get(step_id)
            if step_result:
                return step_result.outputs.get(output_key)

        return None

    def _update_context_outputs(self, outputs_config: Dict[str, str], actual_outputs: Dict[str, Any]) -> None:
        """
        更新上下文变量

        Args:
            outputs_config: 输出配置
            actual_outputs: 实际输出
        """
        for key, value_expr in outputs_config.items():
            # 存储到当前节点作用域
            self.context.set_variable(key, actual_outputs.get(key), VariableScope.NODE)

            # 如果有全局映射，也存储到全局
            if value_expr.startswith("$"):
                pass  # 简化处理

    def _build_final_result(self) -> Dict[str, Any]:
        """
        构建最终结果

        Returns:
            Dict: 执行结果
        """
        return {
            "run_id": self.run_id,
            "flow_id": self.flow_spec.metadata.name,
            "status": self.status.value,
            "results": {
                node_id: result.model_dump()
                for node_id, result in self.execution_results.items()
            },
            "variables": self.context.get_all_variables(),
            "logs": self.context.get_logs(),
            "metadata": {
                "total_time": sum(r.execution_time for r in self.execution_results.values()),
                "total_cost": sum(r.cost for r in self.execution_results.values()),
                "nodes_executed": len(self.execution_results)
            }
        }

    async def _stream_log(self, result: NodeResult) -> None:
        """
        流式输出日志

        Args:
            result: 节点执行结果
        """
        # 这里可以集成到 WebSocket 或 SSE
        # 简化实现：打印到控制台
        print(f"[LOG] Node completed in {result.execution_time:.2f}s, cost: ${result.cost:.4f}")

    def pause(self) -> None:
        """暂停执行"""
        self._pause_event.set()
        self._stop_event.set()
        self.status = ExecutionStatus.PAUSED
        self.context.pause()

    def resume(self) -> None:
        """恢复执行"""
        self._stop_event.clear()
        self._pause_event.clear()
        self.status = ExecutionStatus.RUNNING
        self.context.resume()

    async def stream_execution(self, inputs: Optional[Dict[str, Any]] = None) -> AsyncIterator[Dict[str, Any]]:
        """
        流式执行（实时输出日志）

        Args:
            inputs: 输入参数

        Yields:
            Dict: 执行事件
        """
        # 初始化输入
        if inputs:
            for key, value in inputs.items():
                self.context.set_variable(key, value, VariableScope.GLOBAL, source="inputs")

        # 创建日志流
        log_queue = asyncio.Queue()

        # 开始执行
        task = asyncio.create_task(self._execute_with_logging(log_queue))

        # 流式输出
        try:
            while True:
                log_event = await log_queue.get()
                yield log_event

                if log_event.get("type") == "completion":
                    break
        finally:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    async def _execute_with_logging(self, log_queue: asyncio.Queue) -> None:
        """带日志记录的执行"""
        # 重写 execute 方法以支持日志队列
        # 简化实现
        yield
