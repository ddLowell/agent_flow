"""
FastAPI Server - REST API for AgentFlow
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any, Optional
import asyncio
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from agentflow.core.flow_spec import FlowSpec, load_flow_spec
from agentflow.core.pipeline import PipelineEngine


# API Models
class ValidateRequest(BaseModel):
    """验证请求"""
    flow_spec: str
    verbose: bool = False


class ExecuteRequest(BaseModel):
    """执行请求"""
    flow_spec: str
    inputs: Optional[Dict[str, Any]] = None
    watch: bool = False
    save_state: bool = True
    run_id: Optional[str] = None


class ListFlowsRequest(BaseModel):
    """列出 Flow 请求"""
    directory: str = "./examples/flows"
    verbose: bool = False


class ExecuteFlowRequest(BaseModel):
    """执行 Flow 请求（带监控）"""
    flow_content: str
    input_data: Optional[Dict[str, Any]] = None


# 创建 FastAPI 应用
app = FastAPI(
    title="AgentFlow API",
    description="REST API for AgentFlow workflow management",
    version="0.1.0"
)

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储运行中的执行
running_executions: Dict[str, PipelineEngine] = {}


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "AgentFlow API",
        "version": "0.1.0",
        "status": "running",
        "endpoints": {
            "api/validate": "POST - Validate FlowSpec YAML",
            "api/execute": "POST - Execute Flow workflow",
            "api/status/{run_id}": "GET - Get execution status",
            "api/flows": "GET - List all flows",
            "api/nodes": "GET - List all registered nodes",
            "api/pause/{run_id}": "POST - Pause execution",
            "api/resume/{run_id}": "POST - Resume execution",
            "api/cancel/{run_id}": "POST - Cancel execution",
            "api/version": "GET - Get API version",
        }
    }


@app.get("/api/version")
async def get_version():
    """获取版本信息"""
    return {"version": "0.1.0", "name": "AgentFlow"}


@app.get("/api/nodes")
async def list_nodes():
    """列出所有注册的节点类型"""
    from agentflow.nodes import NodeRegistry

    registered = NodeRegistry.list_registered()

    return {
        "nodes": [
            {
                "type": node_type,
                "class": class_name,
                "description": f"Node type: {node_type}"
            }
            for node_type, class_name in registered.items()
        ],
        "total": len(registered)
    }


@app.post("/api/validate")
async def validate_flow(request: ValidateRequest):
    """验证 FlowSpec YAML 文件"""
    try:
        import yaml

        # 解析 YAML
        flow_data = yaml.safe_load(request.flow_spec)

        # 验证结构
        if not isinstance(flow_data, dict):
            raise HTTPException(status_code=400, detail="Invalid YAML structure")

        if "apiVersion" not in flow_data:
            raise HTTPException(status_code=400, detail="Missing apiVersion")

        if flow_data["apiVersion"] != "agentflow.dev/v1":
            raise HTTPException(status_code=400, detail="Unsupported apiVersion")

        # 创建 FlowSpec 对象（包含验证）
        try:
            flow_spec = FlowSpec.from_yaml(request.flow_spec)

            result = {
                "valid": True,
                "flow_id": flow_spec.metadata.name,
                "version": flow_spec.metadata.version,
                "stages_count": len(flow_spec.get_stages()),
                "nodes_count": len(flow_spec.get_all_nodes()),
            }

            if request.verbose:
                result["details"] = {
                    "metadata": {
                        "name": flow_spec.metadata.name,
                        "version": flow_spec.metadata.version,
                        "description": flow_spec.metadata.description,
                    },
                    "stages": [
                        {
                            "id": stage.id,
                            "name": stage.name,
                            "steps_count": len(stage.steps)
                        }
                        for stage in flow_spec.get_stages()
                    ],
                    "nodes": [
                        {
                            "id": node.id,
                            "type": node.type,
                            "name": node.name
                        }
                        for node in flow_spec.get_all_nodes()
                    ]
                }

            return result

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@app.post("/api/execute")
async def execute_flow(request: ExecuteRequest, background_tasks: BackgroundTasks):
    """执行 Flow 工作流"""
    try:
        import yaml

        # 加载 FlowSpec
        flow_data = yaml.safe_load(request.flow_spec)

        # 验证
        if not isinstance(flow_data, dict):
            raise HTTPException(status_code=400, detail="Invalid YAML structure")

        # 创建 FlowSpec
        flow_spec = FlowSpec.from_yaml(request.flow_spec)

        # 创建 Pipeline Engine
        engine = PipelineEngine(
            flow_spec=flow_spec,
            run_id=request.run_id,
            enable_persistence=request.save_state,
            distributed=False
        )

        # 存储执行实例
        running_executions[engine.run_id] = engine

        # 如果需要监控，返回运行 ID
        if request.watch:
            return {
                "run_id": engine.run_id,
                "flow_id": flow_spec.metadata.name,
                "status": "running",
                "message": "Flow execution started",
                "watch_url": f"/api/stream/{engine.run_id}"
            }

        # 否则执行并返回结果
        import asyncio

        async def run_flow():
            try:
                result = await engine.execute(request.inputs)
                # 清理执行实例
                if engine.run_id in running_executions:
                    del running_executions[engine.run_id]
                return result
            except Exception as e:
                # 标记失败
                engine.fail(str(e))
                raise

        background_tasks.add_task(run_flow())

        # 立即返回（因为后台执行）
        return {
            "run_id": engine.run_id,
            "flow_id": flow_spec.metadata.name,
            "status": "running",
            "message": "Flow execution started in background"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")


@app.get("/api/status/{run_id}")
async def get_execution_status(run_id: str):
    """获取执行状态"""
    from agentflow.core.context import FilePersistenceBackend

    backend = FilePersistenceBackend()
    state = backend.load(run_id)

    if not state:
        raise HTTPException(status_code=404, detail=f"Run ID not found: {run_id}")

    # 获取所有变量
    variables = {}
    for scope in ["global", "stage", "node"]:
        scope_data = state.variables.get(scope, {})
        if scope_data:
            for var_name, var in scope_data.items():
                variables[f"{scope}.{var_name}"] = var.value

    return {
        "run_id": run_id,
        "flow_id": state.flow_id,
        "status": state.status,
        "current_stage": state.current_stage,
        "current_node": state.current_node,
        "created_at": state.created_at,
        "updated_at": state.updated_at,
        "variables": variables,
        "log_count": len(state.execution_log)
    }


@app.post("/api/flows")
async def list_flows(request: ListFlowsRequest):
    """列出所有 Flow 文件"""
    flow_dir = Path(request.directory)

    if not flow_dir.exists():
        raise HTTPException(status_code=404, detail=f"Directory not found: {request.directory}")

    # 查找所有 YAML 文件
    yaml_files = list(flow_dir.glob("*.yaml")) + list(flow_dir.glob("*.yml"))

    flows = []

    for yaml_file in yaml_files:
        try:
            flow_spec = load_flow_spec(yaml_file)

            flow_info = {
                "file_name": yaml_file.name,
                "file_path": str(yaml_file),
                "name": flow_spec.metadata.name,
                "version": flow_spec.metadata.version,
                "description": flow_spec.metadata.description,
                "stages": len(flow_spec.get_stages()),
                "nodes": len(flow_spec.get_all_nodes())
            }

            if request.verbose:
                flow_info["details"] = flow_spec.model_dump()

            flows.append(flow_info)

        except Exception as e:
            flows.append({
                "file_name": yaml_file.name,
                "file_path": str(yaml_file),
                "error": str(e)
            })

    return {
        "directory": request.directory,
        "flows": flows,
        "total": len(flows)
    }


@app.post("/api/pause/{run_id}")
async def pause_execution(run_id: str):
    """暂停执行"""
    if run_id not in running_executions:
        raise HTTPException(status_code=404, detail=f"Run ID not found: {run_id}")

    engine = running_executions[run_id]
    engine.pause()

    return {
        "run_id": run_id,
        "status": "paused",
        "message": "Execution paused"
    }


@app.post("/api/resume/{run_id}")
async def resume_execution(run_id: str):
    """恢复执行"""
    if run_id not in running_executions:
        raise HTTPException(status_code=404, detail=f"Run ID not found: {run_id}")

    engine = running_executions[run_id]
    engine.resume()

    return {
        "run_id": run_id,
        "status": "running",
        "message": "Execution resumed"
    }


@app.post("/api/cancel/{run_id}")
async def cancel_execution(run_id: str):
    """取消执行"""
    if run_id not in running_executions:
        raise HTTPException(status_code=404, detail=f"Run ID not found: {run_id}")

    engine = running_executions[run_id]

    # 取消执行
    engine.context.state.status = "cancelled"
    engine.context.fail("Cancelled by user")

    # 清理执行实例
    del running_executions[run_id]

    return {
        "run_id": run_id,
        "status": "cancelled",
        "message": "Execution cancelled"
    }


@app.get("/api/stream/{run_id}")
async def stream_execution(run_id: str):
    """流式执行日志"""
    from agentflow.core.context import FilePersistenceBackend

    if run_id not in running_executions:
        raise HTTPException(status_code=404, detail=f"Run ID not found: {run_id}")

    engine = running_executions[run_id]

    async def generate_logs():
        """生成 SSE 格式的日志流"""
        last_log_count = 0

        while True:
            # 获取新日志
            logs = engine.context.get_logs()
            new_logs = logs[last_log_count:]

            for log in new_logs:
                log_data = json.dumps({
                    "type": "log",
                    "timestamp": log["timestamp"],
                    "level": log["level"],
                    "message": log["message"],
                    "stage": log.get("stage"),
                    "node": log.get("node")
                })
                yield f"data: {log_data}\n\n"

            last_log_count = len(logs)

            # 检查是否完成
            if engine.context.state.status in ["completed", "failed", "cancelled"]:
                completion_data = json.dumps({
                    "type": "completion",
                    "status": engine.context.state.status
                })
                yield f"event: done\ndata: {completion_data}\n\n"
                break

            # 等待一段时间
            await asyncio.sleep(1)

    return StreamingResponse(
        generate_logs(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/flow-details")
async def get_flow_details(request: Dict[str, str]):
    """获取 Flow 详情"""
    flow_path = request.get("flow_path")

    if not flow_path:
        raise HTTPException(status_code=400, detail="Missing flow_path parameter")

    try:
        flow_spec = load_flow_spec(flow_path)

        return {
            "file_path": flow_path,
            "metadata": {
                "name": flow_spec.metadata.name,
                "version": flow_spec.metadata.version,
                "description": flow_spec.metadata.description,
                "author": flow_spec.metadata.author,
                "tags": flow_spec.metadata.tags,
            },
            "stages": [
                {
                    "id": stage.id,
                    "name": stage.name,
                    "description": stage.description,
                    "steps": [
                        {
                            "id": step.id,
                            "type": step.type,
                            "name": step.name,
                            "config": step.config,
                            "depends_on": step.depends_on
                        }
                        for step in stage.steps
                    ]
                }
                for stage in flow_spec.get_stages()
            ]
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Flow file not found: {flow_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading flow: {str(e)}")


@app.post("/api/save-flow")
async def save_flow(request: Dict[str, str]):
    """保存 Flow 文件"""
    flow_path = request.get("flow_path")
    flow_content = request.get("flow_content")

    if not flow_path or not flow_content:
        raise HTTPException(status_code=400, detail="Missing flow_path or flow_content")

    try:
        path = Path(flow_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(flow_content)

        return {
            "file_path": flow_path,
            "status": "saved",
            "message": "Flow saved successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving flow: {str(e)}")


@app.post("/api/delete-flow")
async def delete_flow(request: Dict[str, str]):
    """删除 Flow 文件"""
    flow_path = request.get("flow_path")

    if not flow_path:
        raise HTTPException(status_code=400, detail="Missing flow_path parameter")

    try:
        path = Path(flow_path)

        if not path.exists():
            raise HTTPException(status_code=404, detail=f"Flow file not found: {flow_path}")

        path.unlink()

        return {
            "file_path": flow_path,
            "status": "deleted",
            "message": "Flow deleted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting flow: {str(e)}")


# 启动服务器的函数
def start_server(host: str = "127.0.0.1", port: int = 8000):
    """启动 FastAPI 服务器"""
    uvicorn.run(
        "agentflow.api.server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    start_server()