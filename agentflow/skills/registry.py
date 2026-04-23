"""Skill Registry - Manage skill types and instances"""

from typing import Dict, Type, Optional, Any
from agentflow.skills.base import BaseSkill, SkillConfig


class SkillRegistry:
    """技能注册表 - 管理所有技能的注册和实例化"""

    _registry: Dict[str, Type[BaseSkill]] = {}
    """已注册的技能类字典"""

    _instances: Dict[str, BaseSkill] = {}
    """技能实例缓存"""

    @classmethod
    def register(cls, skill_name: str, skill_class: Type[BaseSkill]) -> None:
        """
        注册技能类型

        Args:
            skill_name: 技能名称
            skill_class: 技能类

        Raises:
            TypeError: 如果 skill_class 不是 BaseSkill 的子类
            ValueError: 如果 skill_name 已被注册
        """
        if not issubclass(skill_class, BaseSkill):
            raise TypeError(f"{skill_class.__name__} must inherit from BaseSkill")

        if skill_name in cls._registry:
            raise ValueError(f"Skill '{skill_name}' is already registered")

        cls._registry[skill_name] = skill_class

    @classmethod
    def unregister(cls, skill_name: str) -> None:
        """
        注销技能类型

        Args:
            skill_name: 技能名称
        """
        if skill_name in cls._registry:
            del cls._registry[skill_name]
        if skill_name in cls._instances:
            del cls._instances[skill_name]

    @classmethod
    def get(cls, skill_name: str) -> Optional[BaseSkill]:
        """
        获取技能实例

        Args:
            skill_name: 技能名称

        Returns:
            BaseSkill: 技能实例，如果未找到则返回 None
        """
        # 检查缓存
        if skill_name in cls._instances:
            return cls._instances[skill_name]

        # 查找并创建实例
        skill_class = cls._registry.get(skill_name)
        if skill_class is None:
            return None

        # 创建配置
        config = SkillConfig(name=skill_name, description=f"{skill_name} skill")
        instance = skill_class(config)
        cls._instances[skill_name] = instance
        return instance

    @classmethod
    def create_skill(cls, skill_name: str, config: SkillConfig) -> BaseSkill:
        """
        创建技能实例

        Args:
            skill_name: 技能名称
            config: 技能配置

        Returns:
            BaseSkill: 技能实例

        Raises:
            ValueError: 如果技能类型未注册
        """
        skill_class = cls._registry.get(skill_name)
        if skill_class is None:
            raise ValueError(f"Skill '{skill_name}' is not registered")

        return skill_class(config)

    @classmethod
    def list_registered(cls) -> Dict[str, str]:
        """
        列出所有已注册的技能

        Returns:
            Dict[str, str]: 技能名称到类名的映射
        """
        return {
            skill_name: skill_class.__name__
            for skill_name, skill_class in cls._registry.items()
        }

    @classmethod
    def is_registered(cls, skill_name: str) -> bool:
        """
        检查技能是否已注册

        Args:
            skill_name: 技能名称

        Returns:
            bool: 是否已注册
        """
        return skill_name in cls._registry

    @classmethod
    def clear(cls) -> None:
        """清空注册表（主要用于测试）"""
        cls._registry.clear()
        cls._instances.clear()


# 装饰器：自动注册技能类
def register_skill(skill_name: str):
    """
    技能注册装饰器

    用法:
        @register_skill("my_skill")
        class MySkill(BaseSkill):
            ...
    """
    def decorator(skill_class: Type[BaseSkill]):
        SkillRegistry.register(skill_name, skill_class)
        return skill_class
    return decorator