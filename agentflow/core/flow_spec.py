"""FlowSpec - YAML-based workflow definition specification"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml
from pydantic import BaseModel, Field, field_validator


class NodeConfig(BaseModel):
    """节点配置"""

    type: str = Field(..., description="节点类型")
    name: Optional[str] = Field(None, description="节点名称")
    depends_on: Optional[List[str]] = Field(default_factory=list, description="依赖的前置节点 ID")
    config: Dict[str, Any] = Field(default_factory=dict, description="节点特定配置")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="输入配置")
    outputs: Dict[str, str] = Field(default_factory=dict, description="输出映射")

    @field_validator("type")
    @classmethod
    def validate_node_type(cls, v: str) -> str:
        """验证节点类型"""
        valid_types = {
            "script", "mcp_server", "agent_skill", "rag", "conditional",
            "loop", "parallel", "human", "retry", "transform", "http"
        }
        if v not in valid_types:
            raise ValueError(f"Invalid node type: {v}. Valid types: {valid_types}")
        return v


class Stage(BaseModel):
    """阶段定义"""

    id: str = Field(..., description="阶段 ID")
    name: Optional[str] = Field(None, description="阶段名称")
    description: Optional[str] = Field(None, description="阶段描述")
    steps: List[NodeConfig] = Field(default_factory=list, description="阶段中的步骤")


class ErrorHandling(BaseModel):
    """错误处理配置"""

    on_step_failure: Dict[str, Any] = Field(
        default_factory=lambda: {
            "strategy": "stop",
            "max_retries": 3,
            "retry_delay": 5
        },
        description="步骤失败时的处理策略"
    )
    on_stage_failure: Dict[str, Any] = Field(
        default_factory=lambda: {
            "strategy": "stop",
            "fallback_stage": None
        },
        description="阶段失败时的处理策略"
    )


class LearningConfig(BaseModel):
    """学习配置（参考 Hermes）"""

    enabled: bool = Field(False, description="是否启用学习")
    feedback_collection: bool = Field(False, description="是否收集反馈")
    skill_extraction: bool = Field(False, description="是否自动提取技能")


class Metadata(BaseModel):
    """元数据"""

    name: str = Field(..., description="流程名称")
    version: str = Field("1.0.0", description="版本号")
    description: Optional[str] = Field(None, description="流程描述")
    author: Optional[str] = Field(None, description="作者")
    tags: List[str] = Field(default_factory=list, description="标签")
    namespace: Optional[str] = Field(None, description="命名空间")


class FlowSpec(BaseModel):
    """FlowSpec - 工作流定义"""

    api_version: str = Field(default="agentflow.dev/v1", description="API 版本")
    kind: str = Field(default="FlowSpec", description="资源类型")
    metadata: Metadata = Field(..., description="元数据")
    spec: Dict[str, Any] = Field(default_factory=dict, description="流程规范")

    @field_validator("api_version")
    @classmethod
    def validate_api_version(cls, v: str) -> str:
        """验证 API 版本"""
        if v != "agentflow.dev/v1":
            raise ValueError(f"Unsupported api_version: {v}")
        return v

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FlowSpec":
        """从字典创建 FlowSpec"""
        return cls(**data)

    @classmethod
    def from_yaml(cls, yaml_content: str) -> "FlowSpec":
        """从 YAML 内容创建 FlowSpec"""
        data = yaml.safe_load(yaml_content)
        return cls.from_dict(data)

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return self.model_dump()

    def to_yaml(self) -> str:
        """转换为 YAML"""
        return yaml.dump(self.to_dict(), default_flow_style=False, allow_unicode=True)

    def get_stages(self) -> List[Stage]:
        """获取所有阶段"""
        stages_data = self.spec.get("stages", [])
        return [Stage(**stage) for stage in stages_data]

    def get_stage_by_id(self, stage_id: str) -> Optional[Stage]:
        """根据 ID 获取阶段"""
        for stage_data in self.spec.get("stages", []):
            if stage_data.get("id") == stage_id:
                return Stage(**stage_data)
        return None

    def get_all_nodes(self) -> List[NodeConfig]:
        """获取所有节点"""
        nodes = []
        for stage in self.get_stages():
            nodes.extend(stage.steps)
        return nodes

    def get_error_handling(self) -> ErrorHandling:
        """获取错误处理配置"""
        error_data = self.spec.get("error_handling", {})
        return ErrorHandling(**error_data)

    def get_learning_config(self) -> LearningConfig:
        """获取学习配置"""
        learning_data = self.spec.get("learning", {})
        return LearningConfig(**learning_data)

    def validate_flow(self) -> List[str]:
        """验证流程配置，返回错误列表"""
        errors = []

        # 1. 检查阶段唯一性
        stage_ids = [stage.id for stage in self.get_stages()]
        if len(stage_ids) != len(set(stage_ids)):
            errors.append("Duplicate stage IDs found")

        # 2. 检查阶段内节点唯一性
        for stage in self.get_stages():
            node_ids = [step.depends_on for step in stage.steps if step.depends_on]
            # 检查依赖是否存在
            all_node_ids = [f"{stage.id}.{step.id}" for step in stage.steps]

        # 3. 检查循环依赖
        # TODO: 实现循环依赖检测

        return errors


def load_flow_spec(file_path: Path | str) -> FlowSpec:
    """从文件加载 FlowSpec

    Args:
        file_path: YAML 文件路径

    Returns:
        FlowSpec 实例

    Raises:
        FileNotFoundError: 文件不存在
        yaml.YAMLError: YAML 解析错误
        pydantic.ValidationError: 数据验证错误
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"FlowSpec file not found: {file_path}")

    with open(path, "r", encoding="utf-8") as f:
        yaml_content = f.read()

    flow_spec = FlowSpec.from_yaml(yaml_content)

    # 验证流程
    validation_errors = flow_spec.validate_flow()
    if validation_errors:
        raise ValueError(f"FlowSpec validation failed:\n" + "\n".join(validation_errors))

    return flow_spec


def save_flow_spec(flow_spec: FlowSpec, file_path: Path | str) -> None:
    """保存 FlowSpec 到文件

    Args:
        flow_spec: FlowSpec 实例
        file_path: 保存路径
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        f.write(flow_spec.to_yaml())