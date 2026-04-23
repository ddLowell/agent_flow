"""Tests for FlowSpec parsing and validation"""

import pytest
from pathlib import Path
from agentflow.core.flow_spec import FlowSpec, load_flow_spec, NodeConfig, Stage, Metadata
from pydantic import ValidationError


class TestFlowSpec:
    """FlowSpec 测试"""

    def test_load_valid_yaml(self):
        """测试加载有效的 YAML"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
  description: "Test flow"
spec:
  stages:
    - id: stage1
      name: "Stage 1"
      steps:
        - id: step1
          type: script
          name: "Test Step"
          config:
            language: python
            code: "print('hello')"
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)

        assert flow_spec.metadata.name == "test-flow"
        assert flow_spec.metadata.version == "1.0.0"
        assert flow_spec.api_version == "agentflow.dev/v1"

    def test_invalid_api_version(self):
        """测试无效的 API 版本"""
        yaml_content = """
apiVersion: invalid/version
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages: []
"""
        with pytest.raises(ValueError, match="Unsupported api_version"):
            FlowSpec.from_yaml(yaml_content)

    def test_get_stages(self):
        """测试获取阶段列表"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages:
    - id: stage1
      name: "Stage 1"
      steps:
        - id: step1
          type: script
    - id: stage2
      name: "Stage 2"
      steps:
        - id: step2
          type: script
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        stages = flow_spec.get_stages()

        assert len(stages) == 2
        assert stages[0].id == "stage1"
        assert stages[1].id == "stage2"

    def test_get_stage_by_id(self):
        """测试根据 ID 获取阶段"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages:
    - id: stage1
      name: "Stage 1"
      steps:
        - id: step1
          type: script
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        stage = flow_spec.get_stage_by_id("stage1")

        assert stage is not None
        assert stage.name == "Stage 1"
        assert stage.id == "stage1"

    def test_get_all_nodes(self):
        """测试获取所有节点"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: script
        - id: step2
          type: mcp_server
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        nodes = flow_spec.get_all_nodes()

        assert len(nodes) == 2
        assert nodes[0].id == "step1"
        assert nodes[1].id == "step2"

    def test_invalid_node_type(self):
        """测试无效的节点类型"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages:
    - id: stage1
      steps:
        - id: step1
          type: invalid_type
"""
        with pytest.raises(ValueError, match="Invalid node type"):
            FlowSpec.from_yaml(yaml_content)

    def test_load_from_file(self):
        """测试从文件加载 FlowSpec"""
        # 使用项目中的示例文件
        flow_spec = load_flow_spec(Path(__file__).parent.parent.parent / "examples/flows/hello-world.yaml")

        assert flow_spec.metadata.name == "hello-world-flow"
        assert len(flow_spec.get_stages()) == 2

    def test_to_yaml(self):
        """测试转换为 YAML"""
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
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        yaml_output = flow_spec.to_yaml()

        assert "apiVersion: agentflow.dev/v1" in yaml_output
        assert "name: test-flow" in yaml_output
        assert "stage1" in yaml_output

    def test_get_error_handling(self):
        """测试获取错误处理配置"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages: []
  error_handling:
    on_step_failure:
      strategy: retry
      max_retries: 3
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        error_handling = flow_spec.get_error_handling()

        assert error_handling.on_step_failure["strategy"] == "retry"
        assert error_handling.on_step_failure["max_retries"] == 3

    def test_get_learning_config(self):
        """测试获取学习配置"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages: []
  learning:
    enabled: true
    feedback_collection: true
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)
        learning_config = flow_spec.get_learning_config()

        assert learning_config.enabled is True
        assert learning_config.feedback_collection is True