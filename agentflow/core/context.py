"""Context - Execution context with variable scoping and persistence"""

from typing import Any, Dict, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
import json


class VariableScope(str, Enum):
    """变量作用域"""

    GLOBAL = "global"
    STAGE = "stage"
    NODE = "node"


class Variable(BaseModel):
    """变量定义"""

    name: str
    value: Any
    scope: VariableScope
    source: Optional[str] = None  # 来源节点/阶段
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ContextState(BaseModel):
    """上下文状态"""

    run_id: str
    flow_id: str
    status: str = "running"  # running, paused, completed, failed
    variables: Dict[VariableScope, Dict[str, Variable]] = Field(
        default_factory=lambda: {
            VariableScope.GLOBAL: {},
            VariableScope.STAGE: {},
            VariableScope.NODE: {}
        }
    )
    current_stage: Optional[str] = None
    current_node: Optional[str] = None
    execution_log: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Context:
    """执行上下文 - 管理变量、状态和持久化"""

    def __init__(self, run_id: str, flow_id: str):
        """
        初始化上下文

        Args:
            run_id: 运行 ID
            flow_id: 流程 ID
        """
        self.state = ContextState(run_id=run_id, flow_id=flow_id)
        self._persistence_enabled = False
        self._persistence_backend = None

    def set_variable(
        self,
        name: str,
        value: Any,
        scope: VariableScope = VariableScope.GLOBAL,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        设置变量

        Args:
            name: 变量名
            value: 变量值
            scope: 作用域
            source: 来源
            metadata: 元数据
        """
        variable = Variable(
            name=name,
            value=value,
            scope=scope,
            source=source,
            metadata=metadata or {}
        )

        self.state.variables[scope][name] = variable
        self._update_timestamp()

    def get_variable(self, name: str, default: Any = None) -> Any:
        """
        获取变量（按作用域优先级：节点 > 阶段 > 全局）

        Args:
            name: 变量名
            default: 默认值

        Returns:
            Any: 变量值
        """
        # 按优先级查找
        for scope in [VariableScope.NODE, VariableScope.STAGE, VariableScope.GLOBAL]:
            if name in self.state.variables[scope]:
                return self.state.variables[scope][name].value

        return default

    def has_variable(self, name: str) -> bool:
        """
        检查变量是否存在

        Args:
            name: 变量名

        Returns:
            bool: 是否存在
        """
        return any(
            name in self.state.variables[scope]
            for scope in [VariableScope.NODE, VariableScope.STAGE, VariableScope.GLOBAL]
        )

    def delete_variable(self, name: str, scope: Optional[VariableScope] = None) -> None:
        """
        删除变量

        Args:
            name: 变量名
            scope: 作用域（如果为 None，删除所有作用域中的变量）
        """
        if scope:
            self.state.variables[scope].pop(name, None)
        else:
            for s in VariableScope:
                self.state.variables[s].pop(name, None)

        self._update_timestamp()

    def clear_scope(self, scope: VariableScope) -> None:
        """
        清空指定作用域的变量

        Args:
            scope: 作用域
        """
        self.state.variables[scope].clear()
        self._update_timestamp()

    def get_all_variables(self, scope: Optional[VariableScope] = None) -> Dict[str, Any]:
        """
        获取所有变量

        Args:
            scope: 作用域（如果为 None，返回所有作用域）

        Returns:
            Dict[str, Any]: 变量字典
        """
        if scope:
            return {
                name: var.value
                for name, var in self.state.variables[scope].items()
            }

        # 合并所有作用域（节点 > 阶段 > 全局）
        result = {}
        for s in [VariableScope.GLOBAL, VariableScope.STAGE, VariableScope.NODE]:
            result.update({
                name: var.value
                for name, var in self.state.variables[s].items()
            })

        return result

    def set_stage(self, stage_id: str) -> None:
        """
        设置当前阶段

        Args:
            stage_id: 阶段 ID
        """
        self.state.current_stage = stage_id
        self._update_timestamp()

    def set_node(self, node_id: str) -> None:
        """
        设置当前节点

        Args:
            node_id: 节点 ID
        """
        self.state.current_node = node_id
        self._update_timestamp()

    def log(self, level: str, message: str, **kwargs) -> None:
        """
        记录执行日志

        Args:
            level: 日志级别（info, warning, error）
            message: 日志消息
            **kwargs: 额外信息
        """
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "stage": self.state.current_stage,
            "node": self.state.current_node,
            **kwargs
        }

        self.state.execution_log.append(log_entry)
        self._update_timestamp()

    def get_logs(self, level: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取执行日志

        Args:
            level: 日志级别过滤
            limit: 返回数量限制

        Returns:
            List[Dict]: 日志列表
        """
        logs = self.state.execution_log

        if level:
            logs = [log for log in logs if log["level"] == level]

        if limit:
            logs = logs[-limit:]

        return logs

    def pause(self) -> None:
        """暂停执行"""
        self.state.status = "paused"
        self.log("info", "Execution paused")
        self._update_timestamp()
        self._persist()

    def resume(self) -> None:
        """恢复执行"""
        self.state.status = "running"
        self.log("info", "Execution resumed")
        self._update_timestamp()
        self._persist()

    def complete(self) -> None:
        """标记完成"""
        self.state.status = "completed"
        self.log("info", "Execution completed")
        self._update_timestamp()
        self._persist()

    def fail(self, error: str) -> None:
        """
        标记失败

        Args:
            error: 错误信息
        """
        self.state.status = "failed"
        self.log("error", f"Execution failed: {error}")
        self._update_timestamp()
        self._persist()

    def enable_persistence(self, backend: "PersistenceBackend") -> None:
        """
        启用持久化

        Args:
            backend: 持久化后端
        """
        self._persistence_backend = backend
        self._persistence_enabled = True

    def _persist(self) -> None:
        """持久化上下文状态"""
        if not self._persistence_enabled or not self._persistence_backend:
            return

        try:
            self._persistence_backend.save(self.state)
        except Exception as e:
            self.log("warning", f"Failed to persist context: {str(e)}")

    def _update_timestamp(self) -> None:
        """更新时间戳"""
        self.state.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return self.state.model_dump()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Context":
        """从字典创建上下文"""
        state = ContextState(**data)
        context = cls(state.run_id, state.flow_id)
        context.state = state
        return context


class PersistenceBackend:
    """持久化后端抽象类"""

    def save(self, state: ContextState) -> None:
        """保存状态"""
        raise NotImplementedError

    def load(self, run_id: str) -> Optional[ContextState]:
        """加载状态"""
        raise NotImplementedError

    def delete(self, run_id: str) -> None:
        """删除状态"""
        raise NotImplementedError


class FilePersistenceBackend(PersistenceBackend):
    """文件持久化后端"""

    def __init__(self, base_dir: str = "./.agentflow/state"):
        """
        初始化

        Args:
            base_dir: 基础目录
        """
        from pathlib import Path
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, state: ContextState) -> None:
        """保存状态到文件"""
        file_path = self.base_dir / f"{state.run_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(state.model_dump(), f, indent=2, default=str)

    def load(self, run_id: str) -> Optional[ContextState]:
        """从文件加载状态"""
        file_path = self.base_dir / f"{run_id}.json"

        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return ContextState(**data)

    def delete(self, run_id: str) -> None:
        """删除状态文件"""
        file_path = self.base_dir / f"{run_id}.json"
        if file_path.exists():
            file_path.unlink()
