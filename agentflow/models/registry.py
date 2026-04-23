"""Model Registry - Manage model types and instances"""

from typing import Dict, Type, Optional, Any
from agentflow.models.base import BaseModel


class ModelRegistry:
    """模型注册表 - 管理所有模型的注册和实例化"""

    _registry: Dict[str, Type[BaseModel]] = {}
    """已注册的模型类字典"""

    _instances: Dict[str, BaseModel] = {}
    """模型实例缓存"""

    @classmethod
    def register(cls, model_name: str, model_class: Type[BaseModel]) -> None:
        """
        注册模型类型

        Args:
            model_name: 模型名称
            model_class: 模型类

        Raises:
            TypeError: 如果 model_class 不是 BaseModel 的子类
            ValueError: 如果 model_name 已被注册
        """
        if not issubclass(model_class, BaseModel):
            raise TypeError(f"{model_class.__name__} must inherit from BaseModel")

        if model_name in cls._registry:
            raise ValueError(f"Model '{model_name}' is already registered")

        cls._registry[model_name] = model_class

    @classmethod
    def unregister(cls, model_name: str) -> None:
        """
        注销模型类型

        Args:
            model_name: 模型名称
        """
        if model_name in cls._registry:
            del cls._registry[model_name]
        if model_name in cls._instances:
            del cls._instances[model_name]

    @classmethod
    def get(cls, model_name: str) -> Optional[BaseModel]:
        """
        获取模型实例

        Args:
            model_name: 模型名称

        Returns:
            BaseModel: 模型实例，如果未找到则返回 None
        """
        # 检查缓存
        if model_name in cls._instances:
            return cls._instances[model_name]

        # 查找并创建实例
        model_class = cls._registry.get(model_name)
        if model_class is None:
            return None

        instance = model_class(model_name)
        cls._instances[model_name] = instance
        return instance

    @classmethod
    def create_model(cls, model_name: str, config: Dict[str, Any]) -> BaseModel:
        """
        创建模型实例

        Args:
            model_name: 模型名称
            config: 模型配置

        Returns:
            BaseModel: 模型实例

        Raises:
            ValueError: 如果模型类型未注册
        """
        model_class = cls._registry.get(model_name)
        if model_class is None:
            raise ValueError(f"Model '{model_name}' is not registered")

        return model_class(model_name, config)

    @classmethod
    def list_registered(cls) -> Dict[str, str]:
        """
        列出所有已注册的模型

        Returns:
            Dict[str, str]: 模型名称到类名的映射
        """
        return {
            model_name: model_class.__name__
            for model_name, model_class in cls._registry.items()
        }

    @classmethod
    def is_registered(cls, model_name: str) -> bool:
        """
        检查模型是否已注册

        Args:
            model_name: 模型名称

        Returns:
            bool: 是否已注册
        """
        return model_name in cls._registry

    @classmethod
    def clear(cls) -> None:
        """清空注册表（主要用于测试）"""
        cls._registry.clear()
        cls._instances.clear()


# 装饰器：自动注册模型类
def register_model(model_name: str):
    """
    模型注册装饰器

    用法:
        @register_model("gpt-4")
        class GPT4Model(BaseModel):
            ...
    """
    def decorator(model_class: Type[BaseModel]):
        ModelRegistry.register(model_name, model_class)
        return model_class
    return decorator