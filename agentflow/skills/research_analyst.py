"""Research Analyst Skill - Example skill for research tasks"""

from typing import Dict, Any
from agentflow.skills.base import BaseSkill, SkillConfig
from agentflow.skills.registry import register_skill


@register_skill("research-analyst")
class ResearchAnalystSkill(BaseSkill):
    """研究分析师技能 - 分析和总结研究内容"""

    def __init__(self, config: SkillConfig):
        super().__init__(config)

    def get_system_prompt(self) -> str:
        """获取系统提示词"""
        return """You are a research analyst with expertise in analyzing information from multiple sources.

Your task is to:
1. Analyze the provided research materials
2. Identify key themes and patterns
3. Extract important insights
4. Synthesize findings into a comprehensive report

Guidelines:
- Be thorough but concise
- Support your findings with evidence from the source material
- Highlight areas where more research is needed
- Organize your report with clear sections and headings
- Use a professional and objective tone

Output format:
# Research Analysis Report

## Executive Summary
[Brief overview of key findings]

## Key Findings
[Detailed findings organized by theme]

## Insights
[Interpretations and implications]

## Recommendations
[Actionable recommendations based on findings]

## Limitations
[Any limitations in the analysis or source material]"""

    def post_process(self, response: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        """
        后处理模型响应

        Args:
            response: 模型响应
            inputs: 输入数据

        Returns:
            Any: 处理后的结果
        """
        # 提取内容
        content = response.get("content", "")

        # 返回结构化结果
        return {
            "analysis": content,
            "tokens_used": response.get("total_tokens", 0),
            "cost": response.get("cost", 0.0),
            "model": response.get("model", "")
        }