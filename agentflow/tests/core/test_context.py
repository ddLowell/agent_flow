"""Tests for Context and variable management"""

import pytest
import asyncio
from pathlib import Path
from agentflow.core.context import (
    Context,
    ContextState,
    Variable,
    VariableScope,
    FilePersistenceBackend
)


class TestVariable:
    """Variable 测试"""

    def test_variable_creation(self):
        """测试创建变量"""
        variable = Variable(
            name="test_var",
            value="test_value",
            scope=VariableScope.GLOBAL
        )

        assert variable.name == "test_var"
        assert variable.value == "test_value"
        assert variable.scope == VariableScope.GLOBAL

    def test_variable_with_metadata(self):
        """测试带元数据的变量"""
        variable = Variable(
            name="test_var",
            value=123,
            scope=VariableScope.STAGE,
            source="test_node",
            metadata={"type": "integer"}
        )

        assert variable.source == "test_node"
        assert variable.metadata["type"] == "integer"


class TestContext:
    """Context 测试"""

    @pytest.fixture
    def context(self):
        """创建测试上下文"""
        return Context("test_run_id", "test_flow_id")

    def test_context_initialization(self, context):
        """测试上下文初始化"""
        assert context.state.run_id == "test_run_id"
        assert context.state.flow_id == "test_flow_id"
        assert context.state.status == "running"

    def test_set_global_variable(self, context):
        """测试设置全局变量"""
        context.set_variable("name", "Alice", VariableScope.GLOBAL)

        assert context.has_variable("name")
        assert context.get_variable("name") == "Alice"

    def test_set_stage_variable(self, context):
        """测试设置阶段变量"""
        context.set_variable("step_result", 42, VariableScope.STAGE)

        assert context.has_variable("step_result")
        assert context.get_variable("step_result") == 42

    def test_set_node_variable(self, context):
        """测试设置节点变量"""
        context.set_variable("node_output", "success", VariableScope.NODE)

        assert context.has_variable("node_output")
        assert context.get_variable("node_output") == "success"

    def test_variable_priority(self, context):
        """测试变量优先级（节点 > 阶段 > 全局）"""
        context.set_variable("x", 1, VariableScope.GLOBAL)
        context.set_variable("x", 2, VariableScope.STAGE)
        context.set_variable("x", 3, VariableScope.NODE)

        # 应该返回节点级变量
        assert context.get_variable("x") == 3

    def test_get_variable_with_default(self, context):
        """测试获取不存在的变量时返回默认值"""
        result = context.get_variable("nonexistent", "default_value")

        assert result == "default_value"

    def test_delete_variable(self, context):
        """测试删除变量"""
        context.set_variable("temp", "value", VariableScope.GLOBAL)

        assert context.has_variable("temp")

        context.delete_variable("temp", VariableScope.GLOBAL)

        assert not context.has_variable("temp")

    def test_delete_variable_all_scopes(self, context):
        """测试从所有作用域删除变量"""
        context.set_variable("x", 1, VariableScope.GLOBAL)
        context.set_variable("x", 2, VariableScope.STAGE)
        context.set_variable("x", 3, VariableScope.NODE)

        context.delete_variable("x")

        assert not context.has_variable("x")

    def test_clear_scope(self, context):
        """测试清空作用域"""
        context.set_variable("var1", "value1", VariableScope.STAGE)
        context.set_variable("var2", "value2", VariableScope.STAGE)

        assert context.get_all_variables(VariableScope.STAGE) == {"var1": "value1", "var2": "value2"}

        context.clear_scope(VariableScope.STAGE)

        assert context.get_all_variables(VariableScope.STAGE) == {}

    def test_get_all_variables(self, context):
        """测试获取所有变量"""
        context.set_variable("global_var", "g1", VariableScope.GLOBAL)
        context.set_variable("stage_var", "s1", VariableScope.STAGE)
        context.set_variable("node_var", "n1", VariableScope.NODE)

        all_vars = context.get_all_variables()

        assert len(all_vars) == 3
        assert all_vars["global_var"] == "g1"
        assert all_vars["stage_var"] == "s1"
        assert all_vars["node_var"] == "n1"

    def test_set_stage(self, context):
        """测试设置当前阶段"""
        context.set_stage("test_stage")

        assert context.state.current_stage == "test_stage"

    def test_set_node(self, context):
        """测试设置当前节点"""
        context.set_node("test_node")

        assert context.state.current_node == "test_node"

    def test_logging(self, context):
        """测试日志记录"""
        context.log("info", "Test message")

        logs = context.get_logs()

        assert len(logs) == 1
        assert logs[0]["level"] == "info"
        assert logs[0]["message"] == "Test message"

    def test_log_with_stage_and_node(self, context):
        """测试带阶段和节点的日志"""
        context.set_stage("stage1")
        context.set_node("node1")
        context.log("warning", "Warning message")

        logs = context.get_logs()

        assert logs[0]["stage"] == "stage1"
        assert logs[0]["node"] == "node1"

    def test_get_logs_with_level_filter(self, context):
        """测试按级别过滤日志"""
        context.log("info", "Info message")
        context.log("error", "Error message")
        context.log("warning", "Warning message")

        error_logs = context.get_logs(level="error")

        assert len(error_logs) == 1
        assert error_logs[0]["level"] == "error"

    def test_get_logs_with_limit(self, context):
        """测试限制日志返回数量"""
        for i in range(10):
            context.log("info", f"Message {i}")

        last_5_logs = context.get_logs(limit=5)

        assert len(last_5_logs) == 5
        assert last_5_logs[0]["message"] == "Message 5"
        assert last_5_logs[4]["message"] == "Message 9"

    def test_pause_and_resume(self, context):
        """测试暂停和恢复"""
        context.pause()

        assert context.state.status == "paused"

        context.resume()

        assert context.state.status == "running"

    def test_complete(self, context):
        """测试完成"""
        context.complete()

        assert context.state.status == "completed"

    def test_fail(self, context):
        """测试失败"""
        context.fail("Test error")

        assert context.state.status == "failed"

    def test_to_dict(self, context):
        """测试转换为字典"""
        context.set_variable("test_var", "test_value", VariableScope.GLOBAL)
        context.set_stage("test_stage")

        data = context.to_dict()

        assert data["run_id"] == "test_run_id"
        assert data["flow_id"] == "test_flow_id"
        assert "test_var" in data["variables"]["global"]

    def test_from_dict(self):
        """测试从字典创建"""
        state = ContextState(
            run_id="test_run",
            flow_id="test_flow",
            status="running"
        )

        context = Context.from_dict(state.model_dump())

        assert context.state.run_id == "test_run"
        assert context.state.flow_id == "test_flow"


class TestFilePersistenceBackend:
    """FilePersistenceBackend 测试"""

    @pytest.fixture
    def backend(self, tmp_path):
        """创建测试后端"""
        return FilePersistenceBackend(str(tmp_path))

    def test_save_and_load_state(self, backend):
        """测试保存和加载状态"""
        state = ContextState(
            run_id="test_run",
            flow_id="test_flow",
            status="running"
        )

        # 保存
        backend.save(state)

        # 加载
        loaded_state = backend.load("test_run")

        assert loaded_state is not None
        assert loaded_state.run_id == "test_run"
        assert loaded_state.flow_id == "test_flow"

    def test_load_nonexistent_state(self, backend):
        """测试加载不存在的状态"""
        result = backend.load("nonexistent_run")

        assert result is None

    def test_delete_state(self, backend):
        """测试删除状态"""
        state = ContextState(
            run_id="test_run",
            flow_id="test_flow"
        )

        backend.save(state)
        backend.delete("test_run")

        result = backend.load("test_run")

        assert result is None