"""Base Model - Abstract base class for all models"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class ModelResponse(BaseModel):
    """模型响应"""

    content: str
    total_tokens: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost: float = 0.0
    model: str = ""
    metadata: Dict[str, Any] = {}


class BaseModel(ABC):
    """模型基类 - 所有模型必须继承此类"""

    model_name: str
    """模型名称"""

    def __init__(self, model_name: str, config: Optional[Dict[str, Any]] = None):
        """
        初始化模型

        Args:
            model_name: 模型名称
            config: 模型配置
        """
        self.model_name = model_name
        self.config = config or {}

    @abstractmethod
    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> ModelResponse:
        """
        完成文本生成任务

        Args:
            prompt: 用户输入
            system_prompt: 系统提示词
            temperature: 温度参数
            max_tokens: 最大 token 数
            **kwargs: 其他参数

        Returns:
            ModelResponse: 模型响应
        """
        pass

    @abstractmethod
    def get_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        计算成本

        Args:
            input_tokens: 输入 token 数
            output_tokens: 输出 token 数

        Returns:
            float: 成本（美元）
        """
        pass

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(model={self.model_name})"