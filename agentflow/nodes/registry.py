"""Node Registry - Manage node types and instances"""

from typing import Dict, Type, Optional, Any
from agentflow.nodes.base import BaseNode, NodeType, NodeResult
from pydantic import ValidationError


class NodeRegistry:
    """节点注册表 - 管理所有节点类型的注册和实例化"""

    _registry: Dict[str, Type[BaseNode]] = {}
    """已注册的节点类型字典"""

    @classmethod
    def register(cls, node_type: str, node_class: Type[BaseNode]) -> None:
        """
        注册节点类型

        Args:
            node_type: 节点类型标识
            node_class: 节点类

        Raises:
            TypeError: 如果 node_class 不是 BaseNode 的子类
            ValueError: 如果 node_type 已被注册
        """
        if not issubclass(node_class, BaseNode):
            raise TypeError(f"{node_class.__name__} must inherit from BaseNode")

        if node_type in cls._registry:
            raise ValueError(f"Node type '{node_type}' is already registered")

        cls._registry[node_type] = node_class

    @classmethod
    def unregister(cls, node_type: str) -> None:
        """
        注销节点类型

        Args:
            node_type: 节点类型标识
        """
        if node_type in cls._registry:
            del cls._registry[node_type]

    @classmethod
    def get(cls, node_type: str) -> Optional[Type[BaseNode]]:
        """
        获取节点类

        Args:
            node_type: 节点类型标识

        Returns:
            节点类，如果未找到则返回 None
        """
        return cls._registry.get(node_type)

    @classmethod
    def create_node(cls, node_type: str, config: Dict[str, Any]) -> BaseNode:
        """
        创建节点实例

        Args:
            node_type: 节点类型标识
            config: 节点配置

        Returns:
            BaseNode: 节点实例

        Raises:
            ValueError: 如果节点类型未注册
            ValidationError: 如果配置验证失败
        """
        node_class = cls.get(node_type)
        if node_class is None:
            raise ValueError(f"Node type '{node_type}' is not registered")

        # 验证配置（如果节点类实现了 validate_config）
        node_instance = node_class(config)
        if not node_instance.validate_config():
            raise ValidationError(f"Invalid config for node type '{node_type}'")

        return node_instance

    @classmethod
    def list_registered(cls) -> Dict[str, str]:
        """
        列出所有已注册的节点类型

        Returns:
            Dict[str, str]: 节点类型到类名的映射
        """
        return {
            node_type: node_class.__name__
            for node_type, node_class in cls._registry.items()
        }

    @classmethod
    def is_registered(cls, node_type: str) -> bool:
        """
        检查节点类型是否已注册

        Args:
            node_type: 节点类型标识

        Returns:
            bool: 是否已注册
        """
        return node_type in cls._registry

    @classmethod
    def clear(cls) -> None:
        """清空注册表（主要用于测试）"""
        cls._registry.clear()


# 装饰器：自动注册节点类
def register_node(node_type: str):
    """
    节点注册装饰器

    用法:
        @register_node("my_node")
        class MyNode(BaseNode):
            ...
    """
    def decorator(node_class: Type[BaseNode]):
        NodeRegistry.register(node_type, node_class)
        return node_class
    return decorator