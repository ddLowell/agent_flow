"""Tests for FlowSpec"""

import pytest
from pathlib import Path
from agentflow.core.flow_spec import FlowSpec, load_flow_spec


class TestFlowSpec:
    """FlowSpec 测试"""

    def test_load_from_yaml(self):
        """测试从 YAML 加载 FlowSpec"""
        yaml_content = """
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
  version: "1.0.0"
spec:
  stages:
    - id: test-stage
      name: "Test Stage"
      steps:
        - id: test-step
          type: script
          config:
            language: python
"""
        flow_spec = FlowSpec.from_yaml(yaml_content)

        assert flow_spec.metadata.name == "test-flow"
        assert flow_spec.api_version == "agentflow.dev/v1"
        assert flow_spec.kind == "FlowSpec"

    def test_load_from_file(self):
        """测试从文件加载 FlowSpec"""
        flow_spec = load_flow_spec(Path(__file__).parent.parent.parent / "examples/flows/hello-world.yaml")

        assert flow_spec.metadata.name == "hello-world-flow"
        assert flow_spec.metadata.version == "1.0.0"
        assert len(flow_spec.get_stages()) == 2

    def test_get_stages(self):
        """测试获取阶段列表"""
        flow_spec = load_flow_spec(Path(__file__).parent.parent.parent / "examples/flows/hello-world.yaml")
        stages = flow_spec.get_stages()

        assert len(stages) == 2
        assert stages[0].id == "greeting-stage"
        assert stages[1].id == "output-stage"

    def test_get_stage_by_id(self):
        """测试根据 ID 获取阶段"""
        flow_spec = load_flow_spec(Path(__file__).parent.parent.parent / "examples/flows/hello-world.yaml")
        stage = flow_spec.get_stage_by_id("greeting-stage")

        assert stage is not None
        assert stage.name == "Greeting Stage"

    def test_get_all_nodes(self):
        """测试获取所有节点"""
        flow_spec = load_flow_spec(Path(__file__).parent.parent.parent / "examples/flows/hello-world.yaml")
        nodes = flow_spec.get_all_nodes()

        assert len(nodes) == 2
        assert nodes[0].id == "create-greeting"
        assert nodes[1].id == "print-message"

    def test_invalid_api_version(self):
        """测试无效的 API 版本"""
        with pytest.raises(ValueError, match="Unsupported api_version"):
            FlowSpec.from_yaml("""
apiVersion: invalid/version
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages: []
""")

    def test_invalid_node_type(self):
        """测试无效的节点类型"""
        with pytest.raises(ValueError, match="Invalid node type"):
            FlowSpec.from_yaml("""
apiVersion: agentflow.dev/v1
kind: FlowSpec
metadata:
  name: test-flow
spec:
  stages:
    - id: test-stage
      steps:
        - id: test-step
          type: invalid_type
""")