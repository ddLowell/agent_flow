"""AgentFlow - A scalable AI Agent workflow framework"""

__version__ = "0.1.0"
__author__ = "ddLowell"
__license__ = "MIT"

from agentflow.core.pipeline import PipelineEngine
from agentflow.core.flow_spec import FlowSpec

__all__ = [
    "PipelineEngine",
    "FlowSpec",
    "__version__",
]