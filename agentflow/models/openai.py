"""OpenAI Model - OpenAI API integration"""

from typing import Dict, Any, Optional
import httpx
from agentflow.models.base import BaseModel, ModelResponse
from agentflow.models.registry import register_model


@register_model("gpt-4-turbo")
@register_model("gpt-4")
@register_model("gpt-3.5-turbo")
class OpenAIModel(BaseModel):
    """OpenAI 模型实现"""

    # 模型定价（每 1M tokens，美元）
    PRICING = {
        "gpt-4-turbo": {
            "input": 10.0,
            "output": 30.0
        },
        "gpt-4": {
            "input": 30.0,
            "output": 60.0
        },
        "gpt-3.5-turbo": {
            "input": 0.5,
            "output": 1.5
        }
    }

    def __init__(self, model_name: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(model_name, config)
        self.api_key = self.config.get("api_key", "")
        self.base_url = self.config.get("base_url", "https://api.openai.com/v1")
        self.timeout = self.config.get("timeout", 60)

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> ModelResponse:
        """
        调用 OpenAI API 完成文本生成

        Args:
            prompt: 用户输入
            system_prompt: 系统提示词
            temperature: 温度参数
            max_tokens: 最大 token 数
            **kwargs: 其他参数

        Returns:
            ModelResponse: 模型响应
        """
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")

        # 构建请求
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # 添加其他参数
        request_data = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        request_data.update(kwargs)

        # 调用 API
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                json=request_data,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            result = response.json()

        # 解析响应
        choice = result["choices"][0]
        message = choice["message"]
        usage = result["usage"]

        # 计算成本
        input_tokens = usage["prompt_tokens"]
        output_tokens = usage["completion_tokens"]
        cost = self.get_cost(input_tokens, output_tokens)

        return ModelResponse(
            content=message["content"],
            total_tokens=usage["total_tokens"],
            prompt_tokens=input_tokens,
            completion_tokens=output_tokens,
            cost=cost,
            model=self.model_name,
            metadata={
                "finish_reason": choice["finish_reason"],
                "model": result["model"]
            }
        )

    def get_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        计算成本

        Args:
            input_tokens: 输入 token 数
            output_tokens: 输出 token 数

        Returns:
            float: 成本（美元）
        """
        pricing = self.PRICING.get(self.model_name, {"input": 0, "output": 0})

        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]

        return input_cost + output_cost