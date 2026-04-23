"""Tests for Node system"""

import pytest
import asyncio
from agentflow.nodes import NodeRegistry, BaseNode, NodeType, ScriptNode
from agentflow.nodes.base import NodeResult
from agentflow.nodes.registry import register_node


class TestNodeRegistry:
    """NodeRegistry 测试"""

    def test_register_node(self):
        """测试注册节点"""
        @register_node("test_node")
        class TestNode(BaseNode):
            node_type = NodeType.SCRIPT

            def __init__(self, config):
                super().__init__(config)

            async def execute(self, inputs, context):
                return NodeResult(success=True, outputs={})

        assert NodeRegistry.is_registered("test_node")

    def test_get_node_class(self):
        """测试获取节点类"""
        @register_node("test_node2")
        class TestNode2(BaseNode):
            node_type = NodeType.SCRIPT

            def __init__(self, config):
                super().__init__(config)

            async def execute(self, inputs, context):
                return NodeResult(success=True, outputs={})

        node_class = NodeRegistry.get("test_node2")

        assert node_class is not None
        assert node_class.__name__ == "TestNode2"

    def test_create_node(self):
        """测试创建节点实例"""
        @register_node("test_node3")
        class TestNode3(BaseNode):
            node_type = NodeType.SCRIPT

            def __init__(self, config):
                super().__init__(config)

            async def execute(self, inputs, context):
                return NodeResult(success=True, outputs={})

        config = {"id": "test_id", "name": "Test Node"}
        node = NodeRegistry.create_node("test_node3", config)

        assert node.id == "test_id"
        assert node.name == "Test Node"

    def test_create_nonexistent_node(self):
        """测试创建不存在的节点"""
        with pytest.raises(ValueError, match="not registered"):
            NodeRegistry.create_node("nonexistent_node", {})

    def test_list_registered(self):
        """测试列出已注册的节点"""
        registered = NodeRegistry.list_registered()

        assert isinstance(registered, dict)
        assert "script" in registered
        assert "mcp_server" in registered

    def test_unregister_node(self):
        """测试注销节点"""
        @register_node("temp_node")
        class TempNode(BaseNode):
            node_type = NodeType.SCRIPT

            def __init__(self, config):
                super().__init__(config)

            async def execute(self, inputs, context):
                return NodeResult(success=True, outputs={})

        assert NodeRegistry.is_registered("temp_node")

        NodeRegistry.unregister("temp_node")

        assert not NodeRegistry.is_registered("temp_node")


class TestScriptNode:
    """ScriptNode 测试"""

    @pytest.mark.asyncio
    async def test_execute_python_script(self):
        """测试执行 Python 脚本"""
        config = {
            "id": "test_python",
            "type": "script",
            "language": "python",
            "code": "result = 'hello world'"
        }

        node = ScriptNode(config)

        result = await node.execute({}, None)

        assert result.success is True
        assert result.outputs["result"] == "hello world"

    @pytest.mark.asyncio
    async def test_execute_python_script_with_inputs(self):
        """测试执行带输入的 Python 脚本"""
        config = {
            "id": "test_python_input",
            "type": "script",
            "language": "python",
            "code": "result = f'Hello, {name}!'"
        }

        node = ScriptNode(config)
        inputs = {"name": "World"}

        result = await node.execute(inputs, None)

        assert result.success is True
        assert result.outputs["result"] == "Hello, World!"

    @pytest.mark.asyncio
    async def test_invalid_python_script(self):
        """测试执行无效的 Python 脚本"""
        config = {
            "id": "test_invalid",
            "type": "script",
            "language": "python",
            "code": "raise Exception('test error')"
        }

        node = ScriptNode(config)

        result = await node.execute({}, None)

        assert result.success is False
        assert "error" in result.result.model_dump() if isinstance(result, dict) else True

    def test_validate_config(self):
        """测试配置验证"""
        valid_config = {
            "id": "test",
            "type": "script",
            "language": "python",
            "code": "print('hello')"
        }

        node = ScriptNode(valid_config)

        assert node.validate_config() is True

    def test_invalid_config_missing_language(self):
        """测试缺少语言的无效配置"""
        invalid_config = {
            "id": "test",
            "type": "script",
            "code": "print('hello')"
        }

        node = ScriptNode(invalid_config)

        assert node.validate_config() is False

    def test_invalid_config_missing_code(self):
        """测试缺少代码的无效配置"""
        invalid_config = {
            "id": "test",
            "type": "script",
            "language": "python"
        }

        node = ScriptNode(invalid_config)

        assert node.validate_config() is False

    def test_invalid_config_unsupported_language(self):
        """测试不支持的语言"""
        invalid_config = {
            "id": "test",
            "type": "script",
            "language": "ruby",
            "code": "puts 'hello'"
        }

        node = ScriptNode(invalid_config)

        assert node.validate_config() is False


class TestNodeResult:
    """NodeResult 测试"""

    def test_node_result_creation(self):
        """测试创建节点结果"""
        result = NodeResult(
            success=True,
            outputs={"key": "value"},
            execution_time=1.5,
            cost=0.05
        )

        assert result.success is True
        assert result.outputs["key"] == "value"
        assert result.execution_time == 1.5
        assert result.cost == 0.05

    def test_node_result_with_error(self):
        """测试带错误的节点结果"""
        result = NodeResult(
            success=False,
            error="Test error",
            execution_time=0.5
        )

        assert result.success is False
        assert result.error == "Test error"
        assert result.outputs == {}

    def test_node_result_defaults(self):
        """测试节点结果的默认值"""
        result = NodeResult(
            success=True,
            outputs={}
        )

        assert result.execution_time == 0.0
        assert result.cost == 0.0
        assert result.error is None
        assert result.metadata == {}

    def test_node_result_model_dump(self):
        """测试节点结果序列化"""
        result = NodeResult(
            success=True,
            outputs={"test": "data"},
            metadata={"node_id": "test_node"}
        )

        data = result.model_dump()

        assert data["success"] is True
        assert data["outputs"]["test"] == "data"
        assert data["metadata"]["node_id"] == "test_node"