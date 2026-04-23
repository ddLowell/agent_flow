"""Agent Skill Node - Use AI skills"""

from typing import Dict, Any, Optional
from agentflow.nodes.base import BaseNode, NodeResult, NodeType
from agentflow.nodes.registry import register_node


@register_node("agent_skill")
class AgentSkillNode(BaseNode):
    """Agent Skill 节点 - 调用 AI 技能"""

    node_type = NodeType.AGENT_SKILL

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.skill = config.get("skill", "")
        self.model = config.get("model", "gpt-4-turbo")
        self.temperature = config.get("temperature", 0.7)
        self.max_tokens = config.get("max_tokens", 2000)

    def validate_config(self) -> bool:
        """验证配置"""
        if not self.skill:
            return False

        if not self.model:
            return False

        if self.temperature < 0 or self.temperature > 2:
            return False

        return True

    def get_required_inputs(self) -> list[str]:
        """获取必需的输入字段"""
        # Agent Skill 的输入由技能定义决定
        # 默认需要 task 或 prompt
        return ["task"]

    async def execute(self, inputs: Dict[str, Any], context: Any) -> NodeResult:
        """
        执行 Agent Skill

        Args:
            inputs: 输入数据
            context: 执行上下文

        Returns:
            NodeResult: 执行结果
        """
        import time
        start_time = time.time()

        try:
            # 导入模型和技能管理器（稍后实现）
            from agentflow.models import ModelRegistry
            from agentflow.skills import SkillRegistry

            # 获取模型
            model = ModelRegistry.get(self.model)
            if not model:
                raise ValueError(f"Model not found: {self.model}")

            # 获取技能
            skill = SkillRegistry.get(self.skill)
            if not skill:
                raise ValueError(f"Skill not found: {self.skill}")

            # 构建提示词
            system_prompt = skill.get_system_prompt()
            user_input = inputs.get("task", "")

            # 调用模型
            response = await model.complete(
                prompt=user_input,
                system_prompt=system_prompt,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            # 后处理
            processed_result = skill.post_process(response, inputs)

            execution_time = time.time() - start_time
            cost = response.get("cost", 0.0)

            return NodeResult(
                success=True,
                outputs={
                    "result": processed_result,
                    "raw_response": response
                },
                execution_time=execution_time,
                cost=cost,
                metadata={
                    "skill": self.skill,
                    "model": self.model,
                    "temperature": self.temperature,
                    "tokens_used": response.get("total_tokens", 0)
                }
            )

        except Exception as e:
            execution_time = time.time() - start_time

            return NodeResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                metadata={
                    "skill": self.skill,
                    "model": self.model
                }
            )