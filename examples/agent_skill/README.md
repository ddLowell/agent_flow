# Agent Skill Examples

这个目录包含了 AgentFlow 的自定义 Agent Skill 示例。

## 示例技能

### 1. Document Summarizer (document-summarizer)

**功能**: 总结长文档并提取关键信息

**使用场景**:
- 处理研究报告
- 分析长篇文章
- 总结会议记录
- 提取文档关键点

**输入要求**:
```python
{
  "task": "Summarize this document",
  "document": "[文档内容]"
}
```

**输出结构**:
```python
{
  "summary": "执行总结",
  "key_points": "关键点列表",
  "themes": "主要主题",
  "facts": "重要事实和数字",
  "insights": "关键洞察",
  "conclusion": "结论",
  "metadata": {
    "tokens_used": 1234,
    "cost": 0.05,
    "document_length": 15000
  }
}
```

### 2. Code Reviewer (code-reviewer)

**功能**: 审查代码并提供改进建议

**使用场景**:
- Pull Request 审查
- 代码质量检查
- 安全漏洞扫描
- 性能优化建议

**输入要求**:
```python
{
  "task": "Review this code",
  "code": "[代码内容]",
  "language": "python"
}
```

**输出结构**:
```python
{
  "review": "完整审查报告",
  "severity_counts": {
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 2
  },
  "total_issues": 6,
  "code_info": {
    "language": "python",
    "lines_of_code": 150
  },
  "metadata": {
    "tokens_used": 2345,
    "cost": 0.08
  }
}
```

## 创建自定义 Skill

### 基础结构

```python
from typing import Dict, Any
from agentflow.skills.base import BaseSkill, SkillConfig
from agentflow.skills.registry import register_skill

@register_skill("my-skill")
class MySkill(BaseSkill):
    """我的自定义技能"""

    def __init__(self, config: SkillConfig):
        super().__init__(config)

    def get_system_prompt(self) -> str:
        """返回系统提示词"""
        return "You are a helpful assistant."

    def post_process(self, response: Dict[str, Any], inputs: Dict[str, Any]) -> Any:
        """后处理模型响应"""
        content = response.get("content", "")

        # 自定义处理逻辑
        processed_result = self._custom_process(content, inputs)

        return {
            "result": processed_result,
            "metadata": {
                "tokens_used": response.get("total_tokens", 0),
                "cost": response.get("cost", 0.0)
            }
        }

    def _custom_process(self, content: str, inputs: Dict[str, Any]) -> Any:
        # 实现你的自定义逻辑
        return content
```

### 在 FlowSpec 中使用

```yaml
- id: summarize-document
  type: agent_skill
  name: "Summarize Document"
  config:
    skill: document-summarizer
    model: gpt-4-turbo
    temperature: 0.5
    max_tokens: 2000
  inputs:
    task: "Summarize this research paper"
    document: "${inputs.document_content}"
  outputs:
    summary: "${result.summary}"
    key_points: "${result.key_points}"
```

## 技能设计最佳实践

### 1. 系统提示词设计

- **明确角色**: 清楚定义 AI 的角色和专长
- **任务导向**: 明确任务目标和期望输出
- **结构化输出**: 指定输出格式和结构
- **边界条件**: 说明限制和注意事项

### 2. 后处理逻辑

- **结构化提取**: 从非结构化文本中提取结构化数据
- **验证和清洗**: 验证结果并清理无效数据
- **元数据收集**: 记录 token 使用、成本等信息
- **错误处理**: 处理异常情况和边界情况

### 3. 配置灵活性

- **可配置参数**: 通过 config 传递参数
- **多语言支持**: 支持不同语言和框架
- **版本控制**: 记录技能版本和变更

## 技能注册

### 自动注册

使用 `@register_skill` 装饰器自动注册：

```python
@register_skill("my-skill")
class MySkill(BaseSkill):
    ...
```

### 手动注册

```python
from agentflow.skills import SkillRegistry

SkillRegistry.register("my-skill", MySkill)
```

### 列出已注册技能

```python
from agentflow.skills import SkillRegistry

registered = SkillRegistry.list_registered()
print(registered)  # {'my-skill': 'MySkill', ...}
```

## 高级功能

### 技能链

将多个技能串联使用：

```python
class SummarizeSkill(BaseSkill):
    def post_process(self, response, inputs):
        # 生成摘要
        return {"summary": ...}

class TranslateSkill(BaseSkill):
    def post_process(self, response, inputs):
        # 翻译摘要
        return {"translated": ...}
```

### 技能组合

在 FlowSpec 中组合使用：

```yaml
stages:
  - id: process-stage
    steps:
      - id: summarize
        type: agent_skill
        config:
          skill: document-summarizer
        outputs:
          summary: "${result.summary}"

      - id: translate
        type: agent_skill
        depends_on: [summarize]
        config:
          skill: translator
        inputs:
          text: "${stages.process-stage.steps.summarize.outputs.summary}"
```

## 资源和参考

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)