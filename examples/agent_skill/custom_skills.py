"""
示例 Agent Skill - 文档总结技能

这个技能演示如何创建一个自定义的 Agent Skill，
用于总结长文档并提取关键信息。
"""

from typing import Dict, Any
from agentflow.skills.base import BaseSkill, SkillConfig
from agentflow.skills.registry import register_skill


@register_skill("document-summarizer")
class DocumentSummarizerSkill(BaseSkill):
    """文档总结技能 - 总结长文档并提取关键信息"""

    def __init__(self, config: SkillConfig):
        super().__init__(config)

    def get_system_prompt(self) -> str:
        """获取系统提示词"""
        return """You are an expert document summarizer with a talent for extracting and synthesizing key information from complex texts.

Your task is to:
1. Analyze the provided document thoroughly
2. Identify the main themes and key points
3. Extract important facts, figures, and insights
4. Summarize the content while maintaining accuracy
5. Highlight the most critical information

Guidelines:
- Be comprehensive yet concise
- Preserve the original meaning and intent
- Organize information logically
- Use clear and professional language
- Cite specific sections or quotes when relevant
- Identify any limitations or caveats in the source material

Output format should include:
# Executive Summary
[2-3 paragraph overview of the document]

## Key Points
[5-7 bullet points covering the most important information]

## Main Themes
[3-5 major themes identified in the document]

## Important Facts & Figures
[Any statistics, dates, numbers, or quantitative data]

## Critical Insights
[Key takeaways and implications]

## Conclusion
[Brief concluding remarks]"""

    def post_process(self, response: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        """
        后处理模型响应

        Args:
            response: 模型响应
            inputs: 输入数据

        Returns:
            Any: 处理后的结果
        """
        content = response.get("content", "")

        # 提取各部分内容
        sections = self._extract_sections(content)

        return {
            "summary": sections.get("Executive Summary", ""),
            "key_points": sections.get("Key Points", ""),
            "themes": sections.get("Main Themes", ""),
            "facts": sections.get("Important Facts & Figures", ""),
            "insights": sections.get("Critical Insights", ""),
            "conclusion": sections.get("Conclusion", ""),
            "raw_summary": content,
            "metadata": {
                "tokens_used": response.get("total_tokens", 0),
                "cost": response.get("cost", 0.0),
                "model": response.get("model", ""),
                "document_length": len(inputs.get("document", ""))
            }
        }

    def _extract_sections(self, content: str) -> Dict[str, str]:
        """
        从总结中提取各个部分

        Args:
            content: 总结内容

        Returns:
            Dict: 各部分内容的映射
        """
        import re

        sections = {}

        # 定义章节标题模式
        section_patterns = [
            "Executive Summary",
            "Key Points",
            "Main Themes",
            "Important Facts & Figures",
            "Critical Insights",
            "Conclusion"
        ]

        # 使用正则表达式提取各部分
        for i in range(len(section_patterns)):
            section_name = section_patterns[i]
            next_section_name = section_patterns[i + 1] if i < len(section_patterns) - 1 else None

            # 匹配当前章节
            pattern = rf"## {section_name}\s*\n(.*?)(?=\n##|$)"
            match = re.search(pattern, content, re.DOTALL)

            if match:
                sections[section_name] = match.group(1).strip()

        return sections


@register_skill("code-reviewer")
class CodeReviewerSkill(BaseSkill):
    """代码审查技能 - 审查代码并提供改进建议"""

    def __init__(self, config: SkillConfig):
        super().__init__(config)

    def get_system_prompt(self) -> str:
        """获取系统提示词"""
        return """You are a senior software engineer and code reviewer with expertise in multiple programming languages, software architecture, and best practices.

Your task is to:
1. Review the provided code thoroughly
2. Identify potential bugs and issues
3. Assess code quality and maintainability
4. Check for security vulnerabilities
5. Evaluate performance implications
6. Suggest improvements and refactoring opportunities

Guidelines:
- Be constructive and specific in your feedback
- Provide explanations for why changes are recommended
- Consider edge cases and error handling
- Evaluate code style and adherence to best practices
- Check for proper documentation and comments
- Identify potential security issues (SQL injection, XSS, etc.)
- Assess performance and scalability concerns

Output format should include:
# Code Review Summary
[Brief overview of the code and its purpose]

## Strengths
[What the code does well]

## Issues & Concerns
[List any bugs, errors, or problematic areas]

## Security Considerations
[Any security vulnerabilities or concerns]

## Performance Issues
[Performance-related concerns and suggestions]

## Best Practices & Style
[Adherence to coding standards and conventions]

## Recommendations
[Specific, actionable suggestions for improvement]

## Code Examples
[Provide before/after code examples where applicable]

## Overall Assessment
[Summary rating and final thoughts]"""

    def post_process(self, response: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        """后处理模型响应"""
        content = response.get("content", "")

        # 分析问题严重性
        severity_keywords = {
            "critical": ["security", "vulnerability", "exploit", "injection"],
            "high": ["bug", "error", "crash", "performance"],
            "medium": ["improve", "refactor", "optimize"],
            "low": ["style", "formatting", "documentation"]
        }

        severity_counts = {level: 0 for level in severity_keywords}
        for level, keywords in severity_keywords.items():
            for keyword in keywords:
                severity_counts[level] += content.lower().count(keyword)

        return {
            "review": content,
            "severity_counts": severity_counts,
            "total_issues": sum(severity_counts.values()),
            "code_info": {
                "language": inputs.get("language", "unknown"),
                "lines_of_code": len(inputs.get("code", "").splitlines())
            },
            "metadata": {
                "tokens_used": response.get("total_tokens", 0),
                "cost": response.get("cost", 0.0),
                "model": response.get("model", "")
            }
        }