"""Base Skill - Abstract base class for all skills"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel


class SkillConfig(BaseModel):
    """技能配置"""

    name: str
    description: str
    version: str = "1.0.0"
    author: Optional[str] = None
    tags: List[str] = []


class BaseSkill(ABC):
    """技能基类 - 所有技能必须继承此类"""

    config: SkillConfig

    def __init__(self, config: SkillConfig):
        """
        初始化技能

        Args:
            config: 技能配置
        """
        self.config = config

    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        获取系统提示词

        Returns:
            str: 系统提示词
        """
        pass

    @abstractmethod
    def post_process(self, response: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        """
        后处理模型响应

        Args:
            response: 模型响应
            inputs: 输入数据

        Returns:
            Any: 处理后的结果
        """
        pass

    def get_required_inputs(self) -> List[str]:
        """
        获取必需的输入字段

        Returns:
            List[str]: 必需字段列表
        """
        return ["task"]

    def validate_inputs(self, inputs: Dict[str, Any]) -> bool:
        """
        验证输入数据

        Args:
            inputs: 输入数据

        Returns:
            bool: 是否有效
        """
        required = self.get_required_inputs()
        return all(key in inputs for key in required)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self.config.name})"