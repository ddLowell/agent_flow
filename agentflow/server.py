#!/usr/bin/env python3
"""
AgentFlow FastAPI 服务器
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import uvicorn
from pathlib import Path

app = FastAPI(title="AgentFlow API", version="0.1.0")

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据存储
flows_store: Dict[str, Any] = {}
executions_store: Dict[str, Any] = {}

# Pydantic 模型
class FlowSpec(BaseModel):
    apiVersion: str
    kind: str
    metadata: Dict[str, Any]
    spec: Dict[str, Any]

class ExecutionRequest(BaseModel):
    flow_spec: str
    inputs: Optional[Dict[str, Any]] = None
    watch: bool = False
    save_state: bool = True
    run_id: Optional[str] = None

class NodeInfo(BaseModel):
    node_type: str
    class_name: str
    description: str

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "AgentFlow API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

@app.get("/api/version")
async def get_version():
    """获取版本信息"""
    return {"version": "0.1.0"}

@app.post("/api/validate")
async def validate_flow(flow: FlowSpec, verbose: bool = False):
    """验证 FlowSpec"""
    try:
        from agentflow.core.flow_spec import FlowSpec as FlowSpecModel
        
        # 验证基本结构
        if flow.apiVersion != "agentflow.dev/v1":
            raise HTTPException(status_code=400, detail="Invalid API version")
        
        if flow.kind != "FlowSpec":
            raise HTTPException(status_code=400, detail="Invalid kind")
        
        # 验证 metadata
        if not flow.metadata.get("name"):
            raise HTTPException(status_code=400, detail="Flow name is required")
        
        # 验证 stages
        spec = flow.spec
        stages = spec.get("stages", [])
        if not stages:
            raise HTTPException(status_code=400, detail="At least one stage is required")
        
        result = {
            "valid": True,
            "flow_name": flow.metadata.get("name"),
            "version": flow.metadata.get("version", "1.0.0"),
            "stages_count": len(stages),
            "nodes_count": sum(len(stage.get("steps", [])) for stage in stages)
        }
        
        if verbose:
            result["details"] = {
                "description": flow.metadata.get("description"),
                "stages": stages,
                "error_handling": spec.get("error_handling"),
                "learning": spec.get("learning")
            }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@app.post("/api/execute")
async def execute_flow(request: ExecutionRequest):
    """执行 Flow"""
    from agentflow.core.flow_spec import FlowSpec as FlowSpecModel
    from agentflow.core.pipeline import PipelineEngine
    
    try:
        # 解析 FlowSpec
        flow_obj = FlowSpecModel(**request.flow_spec.model_dump())
        
        # 创建 Pipeline Engine
        engine = PipelineEngine(
            flow_spec=flow_obj,
            run_id=request.run_id,
            enable_persistence=request.save_state
        )
        
        # 执行流程
        if request.watch:
            # 流式执行（模拟）
            return {
                "run_id": engine.run_id,
                "status": "running",
                "message": "Execution started (streaming not fully implemented)"
            }
        else:
            # 执行流程
            inputs = request.inputs or {}
            result = await engine.execute(inputs)
            
            return {
                "run_id": engine.run_id,
                "status": "completed",
                "result": result
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

@app.get("/api/status/{run_id}")
async def get_execution_status(run_id: str):
    """获取执行状态"""
    from agentflow.core.context import FilePersistenceBackend
    
    try:
        backend = FilePersistenceBackend()
        state = backend.load(run_id)
        
        if not state:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        return {
            "run_id": run_id,
            "flow_id": state.flow_id,
            "status": state.status,
            "variables": state.variables,
            "logs": state.execution_log[-20:],  # 最近 20 条日志
            "created_at": state.created_at,
            "updated_at": state.updated_at
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status error: {str(e)}")

@app.get("/api/nodes")
async def list_nodes():
    """列出所有注册的节点"""
    from agentflow.nodes import NodeRegistry
    
    nodes = NodeRegistry.list_registered()
    
    node_info = []
    for node_type, class_name in nodes.items():
        node_info.append({
            "node_type": node_type,
            "class_name": class_name,
            "description": f"Node type: {node_type}"
        })
    
    return {
        "nodes": node_info,
        "count": len(node_info)
    }

@app.get("/api/flows")
async def list_flows(directory: str = "./flows"):
    """列出所有 Flow"""
    from agentflow.core.flow_spec import load_flow_spec
    from pathlib import Path
    
    flow_dir = Path(directory)
    if not flow_dir.exists():
        return {"flows": [], "directory": str(directory)}
    
    yaml_files = list(flow_dir.glob("*.yaml")) + list(flow_dir.glob("*.yml"))
    
    flows = []
    for yaml_file in yaml_files:
        try:
            flow_spec = load_flow_spec(yaml_file)
            flows.append({
                "name": flow_spec.metadata.name,
                "version": flow_spec.metadata.version,
                "description": flow_spec.metadata.description,
                "file": yaml_file.name,
                "path": str(yaml_file),
                "stages_count": len(flow_spec.get_stages()),
                "valid": True
            })
        except Exception as e:
            flows.append({
                "name": yaml_file.stem,
                "version": "N/A",
                "description": f"Error: {str(e)}",
                "file": yaml_file.name,
                "path": str(yaml_file),
                "stages_count": 0,
                "valid": False
            })
    
    return {
        "flows": flows,
        "directory": str(directory),
        "count": len(flows)
    }

@app.post("/api/upload-flow")
async def upload_flow(file: Any):
    """上传 Flow 文件"""
    import aiofiles
    import os
    from pathlib import Path
    
    # 确保目录存在
    upload_dir = Path("./flows")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 保存文件
    file_path = upload_dir / file.filename
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(await file.read())
    
    # 读取并验证
    try:
        from agentflow.core.flow_spec import load_flow_spec
        flow_spec = load_flow_spec(file_path)
        
        return {
            "success": True,
            "message": "Flow uploaded successfully",
            "flow": {
                "name": flow_spec.metadata.name,
                "version": flow_spec.metadata.version,
                "file": file.filename
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error validating flow: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
