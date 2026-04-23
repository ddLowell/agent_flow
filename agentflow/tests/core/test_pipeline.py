"""Tests for Pipeline Engine"""

import pytest
import asyncio
from agentflow.core.pipeline import PipelineEngine, ExecutionStatus
from agentflow.core.flow_spec import FlowSpec, NodeConfig, Stage
from agentflow.core.context import Context


class TestPipelineEngine:
    """Pipeline Engine 测试"""

    @pytest.fixture
    def simple_flow_spec(self):
        """创建简单的流程规范"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      name: "Test Stage"
      steps:
        - id: step1
          type: script
          name: "Test Step"
          config:
            language: python
            code: "result = 'Hello, World!'"
          outputs:
            greeting: "${result}"
"""
        return FlowSpec.from_yaml(yaml_content)

    def test_engine_initialization(self, simple_flow_spec):
        """测试引擎初始化"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            run_id="test_run",
            enable_persistence=False
        )

        assert engine.flow_spec.metadata.name == "test-flow"
        assert engine.run_id == "test_run"
        assert engine.status == ExecutionStatus.PENDING

    def test_engine_generate_run_id(self, simple_flow_spec):
        """测试生成运行 ID"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        import re
        assert re.match(r'run_[a-f0-9]{12}_\d{8}_\d{6}', engine.run_id)

    @pytest.mark.asyncio
    async def test_execute_simple_flow(self, simple_flow_spec):
        """测试执行简单流程"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        result = await engine.execute()

        assert result["status"] == "completed"
        assert result["metadata"]["nodes_executed"] == 1
        assert "step1" in result["results"]

    @pytest.mark.asyncio
    async def test_execute_with_inputs(self, simple_flow_spec):
        """测试带输入的执行"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        inputs = {"name": "Alice"}

        # 注意：这个测试需要修改 FlowSpec 以使用输入
        result = await engine.execute(inputs)

        assert result["status"] == "completed"

    @pytest.mark.asyncio
    async def test_execute_multi_stage_flow(self):
        """测试执行多阶段流程"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: multi-stage-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
          config:
            language: python
            code: "result = 'Stage 1'"
    - id: stage2
      steps:
        - id: step2
          type: script
          config:
            language: python
            code: "result = 'Stage 2'"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        engine = PipelineEngine(
            flow_spec=flow_spec,
            enable_persistence=False
        )

        result = await engine.execute()

        assert result["status"] == "completed"
        assert result["metadata"]["nodes_executed"] == 2

    @pytest.mark.asyncio
    async def test_execute_with_dependencies(self):
        """测试带依赖的执行"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: dependency-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
          config:
            language: python
            code: "result = 100"
          outputs:
            value: "${result}"
        - id: step2
          type: script
          depends_on: [step1]
          config:
            language: python
            code: "result = ${inputs.value} + 50"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        engine = PipelineEngine(
            flow_spec=flow_spec,
            enable_persistence=False
        )

        result = await engine.execute()

        assert result["status"] == "completed"
        assert result["metadata"]["nodes_executed"] == 2

    def test_build_execution_order(self, simple_flow_spec):
        """测试构建执行顺序"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        stages = simple_flow_spec.get_stages()
        order = engine._build_execution_order(stages[0].steps)

        assert len(order) == 1
        assert order[0].id == "step1"

    def test_build_execution_order_with_dependencies(self):
        """测试带依赖的执行顺序"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
          config:
            language: python
            code: "result = 100"
        - id: step2
          type: script
          depends_on: [step1]
          config:
            language: python
            code: "result = 200"
        - id: step3
          type: script
          depends_on: [step1, step2]
          config:
            language: python
            code: "result = 300"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        engine = PipelineEngine(
            flow_spec=flow_spec,
            enable_persistence=False
        )

        stages = flow_spec.get_stages()
        order = engine._build_execution_order(stages[0].steps)

        assert len(order) == 3
        # step1 应该先执行（无依赖）
        assert order[0].id == "step1"
        # step2 应该在 step1 之后
        assert order[1].id == "step2"
        # step3 应该在 step1 和 step2 之后
        assert order[2].id == "step3"

    def test_prepare_inputs(self, simple_flow_spec):
        """测试准备输入"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        # 设置变量
        engine.context.set_variable("test_var", "test_value", from agentflow.core.context import VariableScope)

        inputs_config = {
            "key1": "${inputs.test_var}",
            "key2": "static_value"
        }

        prepared = engine._prepare_inputs(inputs_config)

        assert prepared["key1"] == "test_value"
        assert prepared["key2"] == "static_value"

    def test_resolve_variable_expression(self, simple_flow_spec):
        """测试解析变量表达式"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        # 设置全局变量
        engine.context.set_variable("name", "Alice", from agentflow.core.context import VariableScope)

        # 解析 inputs.xxx 表达式
        result = engine._resolve_variable_expression("${inputs.name}")

        assert result == "Alice"

    def test_resolve_stage_output_expression(self):
        """测试解析阶段输出表达式"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
          config:
            language: python
            code: "result = 'test_output'"
          outputs:
            output: "${result}"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        engine = PipelineEngine(
            flow_spec=flow_spec,
            enable_persistence=False
        )

        # 模拟节点执行结果
        from agentflow.nodes.base import NodeResult
        mock_result = NodeResult(
            success=True,
            outputs={"output": "test_output"}
        )
        engine.execution_results["step1"] = mock_result

        # 解析 stages.xxx.outputs.xxx 表达式
        result = engine._resolve_variable_expression("${stages.stage1.steps.step1.outputs.output}")

        assert result == "test_output"

    def test_build_final_result(self, simple_flow_spec):
        """测试构建最终结果"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        # 添加执行结果
        from agentflow.nodes.base import NodeResult
        engine.execution_results["step1"] = NodeResult(
            success=True,
            outputs={"result": "test"},
            execution_time=1.5,
            cost=0.01
        )

        final_result = engine._build_final_result()

        assert final_result["run_id"] == engine.run_id
        assert final_result["flow_id"] == "test-flow"
        assert final_result["metadata"]["nodes_executed"] == 1
        assert final_result["metadata"]["total_time"] == 1.5
        assert final_result["metadata"]["total_cost"] == 0.01

    def test_pause_and_resume(self, simple_flow_spec):
        """测试暂停和恢复"""
        engine = PipelineEngine(
            flow_spec=simple_flow_spec,
            enable_persistence=False
        )

        assert engine.status == ExecutionStatus.PENDING

        engine.pause()

        assert engine.status == ExecutionStatus.PAUSED

        engine.resume()

        assert engine.status == ExecutionStatus.RUNNING

    @pytest.mark.asyncio
    async def test_execute_with_persistence(self, tmp_path):
        """测试带持久化的执行"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
          config:
            language: python
            code: "result = 'Hello'"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)

        # 使用临时目录作为持久化后端
        from agentflow.core.context import FilePersistenceBackend
        backend = FilePersistenceBackend(str(tmp_path))

        engine = PipelineEngine(
            flow_spec=flow_spec,
            enable_persistence=True,
            distributed=False
        )
        engine.context.enable_persistence(backend)

        result = await engine.execute()

        assert result["status"] == "completed"

        # 检查状态文件是否创建
        state_file = tmp_path / f"{engine.run_id}.json"
        assert state_file.exists()