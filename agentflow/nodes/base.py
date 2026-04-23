"""Base Node - Abstract base class for all node types"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, List
from enum import Enum
# TODO: 待 Context 实现后取消注释
# from agentflow.core.context import Context
from pydantic import BaseModel, Field


class NodeType(str, Enum):
    """节点类型枚举"""

    SCRIPT = "script"
    MCP_SERVER = "mcp_server"
    AGENT_SKILL = "agent_skill"
    RAG = "rag"
    CONDITIONAL = "conditional"
    LOOP = "loop"
    PARALLEL = "parallel"
    HUMAN = "human"
    RETRY = "retry"
    TRANSFORM = "transform"
    HTTP = "http"


class NodeResult(BaseModel):
    """节点执行结果"""

    success: bool = Field(..., description="是否成功")
    outputs: Dict[str, Any] = Field(default_factory=dict, description="输出数据")
    error: Optional[str] = Field(None, description="错误信息")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="元数据")
    execution_time: float = Field(0.0, description="执行时间（秒）")
    cost: float = Field(0.0, description="执行成本（美元）")


class BaseNode(ABC):
    """节点基类 - 所有节点类型必须继承此类"""

    node_type: NodeType = NotImplemented
    """节点类型"""

    def __init__(self, config: Dict[str, Any]):
        """
        初始化节点

        Args:
            config: 节点配置字典
        """
        self.config = config
        self.id = config.get("id", "")
        self.name = config.get("name", "")
        self.depends_on = config.get("depends_on", [])

    @abstractmethod
    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行节点逻辑（异步方法）

        Args:
            inputs: 输入数据
            context: 执行上下文（待实现）

        Returns:
            NodeResult: 执行结果
        """
        pass

    def validate_inputs(self, inputs: Dict[str, Any]) -> bool:
        """
        验证输入数据

        Args:
            inputs: 输入数据

        Returns:
            bool: 是否有效
        """
        # 默认验证逻辑，子类可以重写
        return True

    def validate_config(self) -> bool:
        """
        验证节点配置

        Returns:
            bool: 是否有效
        """
        # 默认验证逻辑，子类可以重写
        return True

    def get_required_inputs(self) -> List[str]:
        """
        获取必需的输入字段

        Returns:
            List[str]: 必需字段列表
        """
        # 默认返回空列表，子类可以重写
        return []

    def get_output_schema(self) -> Dict[str, Any]:
        """
        获取输出结构定义

        Returns:
            Dict[str, Any]: 输出结构
        """
        # 默认返回空字典，子类可以重写
        return {}

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id}, name={self.name})"