"""AgentFlow - A scalable AI Agent workflow framework"""

__version__ = "0.1.0"
__author__ = "ddLowell"
__license__ = "MIT"

# TODO: 待 PipelineEngine 实现后取消注释
# from agentflow.core.pipeline import PipelineEngine
from agentflow.core.flow_spec import FlowSpec

__all__ = [
    # "PipelineEngine",  # 待实现
    "FlowSpec",
    "__version__",
]