"""AgentFlow CLI - Command line interface"""

from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

from agentflow.core.flow_spec import load_flow_spec, FlowSpec
from agentflow.core.pipeline import PipelineEngine
from agentflow.nodes import NodeRegistry

app = typer.Typer(
    name="agentflow",
    help="AgentFlow - A scalable AI Agent workflow framework",
    add_completion=False
)

console = Console()


@app.command()
def validate(
    flow_file: str = typer.Argument(..., help="Path to FlowSpec YAML file"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show detailed validation results")
):
    """
    Validate a FlowSpec YAML file

    Example:
        agentflow validate flows/my-flow.yaml
    """
    console.print(f"[bold blue]Validating flow:[/bold blue] {flow_file}")

    try:
        # 加载 FlowSpec（包含验证）
        flow_spec = load_flow_spec(flow_file)

        console.print("[green]✓[/green] FlowSpec is valid!")

        if verbose:
            # 显示详细信息
            console.print("\n[bold]Flow Details:[/bold]")
            console.print(f"  Name: {flow_spec.metadata.name}")
            console.print(f"  Version: {flow_spec.metadata.version}")
            console.print(f"  Description: {flow_spec.metadata.description}")

            stages = flow_spec.get_stages()
            console.print(f"\n[bold]Stages:[/bold] {len(stages)}")
            for stage in stages:
                console.print(f"  - {stage.id}: {stage.name or 'No name'} ({len(stage.steps)} steps)")

            nodes = flow_spec.get_all_nodes()
            console.print(f"\n[bold]Total Nodes:[/bold] {len(nodes)}")

            # 统计节点类型
            node_types = {}
            for node in nodes:
                node_type = node.type
                node_types[node_type] = node_types.get(node_type, 0) + 1

            console.print("\n[bold]Node Types:[/bold]")
            for node_type, count in sorted(node_types.items()):
                console.print(f"  - {node_type}: {count}")

    except Exception as e:
        console.print(f"[red]✗[/red] Validation failed: {str(e)}")
        raise typer.Exit(1)


@app.command()
def run(
    flow_file: str = typer.Argument(..., help="Path to FlowSpec YAML file"),
    input_data: Optional[str] = typer.Option(None, "--input", "-i", help="Input data as JSON string"),
    watch: bool = typer.Option(False, "--watch", "-w", help="Watch execution in real-time"),
    save_state: bool = typer.Option(True, "--save-state/--no-save-state", help="Save execution state"),
    run_id: Optional[str] = typer.Option(None, "--run-id", help="Custom run ID")
):
    """
    Execute a FlowSpec workflow

    Example:
        agentflow run flows/my-flow.yaml --input '{"name": "World"}'
    """
    console.print(f"[bold blue]Executing flow:[/bold blue] {flow_file}")

    try:
        # 加载 FlowSpec
        flow_spec = load_flow_spec(flow_file)

        # 解析输入数据
        inputs = {}
        if input_data:
            import json
            try:
                inputs = json.loads(input_data)
            except json.JSONDecodeError as e:
                console.print(f"[red]✗[/red] Invalid JSON input: {str(e)}")
                raise typer.Exit(1)

        # 创建 Pipeline Engine
        engine = PipelineEngine(
            flow_spec=flow_spec,
            run_id=run_id,
            enable_persistence=save_state,
            distributed=False
        )

        console.print(f"[green]✓[/green] Flow loaded successfully")
        console.print(f"[dim]Run ID:[/dim] {engine.run_id}")

        # 执行流程
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Executing flow...", total=None)

            if watch:
                # 实时监控
                async def execute_with_monitor():
                    async for event in engine.stream_execution(inputs):
                        if event["type"] == "log":
                            level = event["level"]
                            message = event["message"]
                            color = {"info": "blue", "warning": "yellow", "error": "red"}.get(level, "white")
                            console.print(f"[{color}]  {message}[/{color}]")

                import asyncio
                asyncio.run(execute_with_monitor())
            else:
                # 普通执行
                import asyncio
                result = asyncio.run(engine.execute(inputs))

            progress.remove_task(task)

        # 显示结果
        console.print("\n[bold green]✓ Execution completed successfully![/bold green]")

        console.print("\n[bold]Results:[/bold]")
        console.print(f"  Nodes executed: {result['metadata']['nodes_executed']}")
        console.print(f"  Total time: {result['metadata']['total_time']:.2f}s")
        console.print(f"  Total cost: ${result['metadata']['total_cost']:.4f}")

    except Exception as e:
        console.print(f"\n[red]✗ Execution failed:[/red] {str(e)}")
        raise typer.Exit(1)


@app.command()
def status(
    run_id: str = typer.Argument(..., help="Run ID to check")
):
    """
    Check the status of a running or completed flow execution

    Example:
        agentflow status run_abc123_20260422_180000
    """
    console.print(f"[bold blue]Checking status:[/bold blue] {run_id}")

    try:
        # 尝试加载状态文件
        from agentflow.core.context import FilePersistenceBackend
        backend = FilePersistenceBackend()
        state = backend.load(run_id)

        if not state:
            console.print(f"[yellow]![/yellow] No execution found with ID: {run_id}")
            return

        # 显示状态
        status_color = {
            "running": "blue",
            "paused": "yellow",
            "completed": "green",
            "failed": "red"
        }.get(state.status, "white")

        console.print(f"[bold]Status:[/bold] [{status_color}]{state.status}[/{status_color}]")
        console.print(f"[bold]Flow ID:[/bold] {state.flow_id}")
        console.print(f"[bold]Created at:[/bold] {state.created_at}")
        console.print(f"[bold]Updated at:[/bold] {state.updated_at}")

        # 显示变量
        console.print("\n[bold]Variables:[/bold]")
        variables = state.variables
        for scope in ["global", "stage", "node"]:
            scope_vars = variables.get(scope, {})
            if scope_vars:
                console.print(f"\n  [{scope.upper()} Scope]")
                for var_name, var in scope_vars.items():
                    value_str = str(var.value)[:50] + "..." if len(str(var.value)) > 50 else str(var.value)
                    console.print(f"    - {var_name}: {value_str}")

        # 显示最近的日志
        console.print("\n[bold]Recent Logs:[/bold]")
        logs = state.execution_log[-10:]
        for log in logs:
            level_color = {"info": "blue", "warning": "yellow", "error": "red"}.get(log["level"], "white")
            console.print(f"  [{level_color}] [{log['timestamp']}] {log['message']}[/{level_color}]")

    except Exception as e:
        console.print(f"[red]✗[/red] Error checking status: {str(e)}")
        raise typer.Exit(1)


@app.command()
def flows(
    directory: str = typer.Argument("./flows", help="Directory containing flow files"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show detailed information")
):
    """
    List all available flows in a directory

    Example:
        agentflow flows ./flows
    """
    console.print(f"[bold blue]Listing flows in:[/bold blue] {directory}")

    flow_dir = Path(directory)
    if not flow_dir.exists():
        console.print(f"[red]✗[/red] Directory not found: {directory}")
        raise typer.Exit(1)

    # 查找所有 YAML 文件
    yaml_files = list(flow_dir.glob("*.yaml")) + list(flow_dir.glob("*.yml"))

    if not yaml_files:
        console.print("[yellow]![/yellow] No flow files found")
        return

    # 创建表格
    table = Table(title="Available Flows")
    table.add_column("Name", style="cyan")
    table.add_column("File", style="white")
    table.add_column("Version", style="green")
    table.add_column("Description", style="dim")

    for yaml_file in yaml_files:
        try:
            flow_spec = load_flow_spec(yaml_file)
            table.add_row(
                flow_spec.metadata.name,
                yaml_file.name,
                flow_spec.metadata.version,
                flow_spec.metadata.description or "-"
            )
        except Exception:
            table.add_row(
                yaml_file.stem,
                yaml_file.name,
                "[red]Invalid[/red]",
                "[red]Failed to load[/red]"
            )

    console.print(table)


@app.command()
def nodes():
    """
    List all registered node types

    Example:
        agentflow nodes
    """
    console.print("[bold blue]Registered Node Types:[/bold blue]\n")

    node_types = NodeRegistry.list_registered()

    if not node_types:
        console.print("[yellow]![/yellow] No nodes registered")
        return

    table = Table()
    table.add_column("Node Type", style="cyan")
    table.add_column("Class", style="green")

    for node_type, class_name in sorted(node_types.items()):
        table.add_row(node_type, class_name)

    console.print(table)


@app.command()
def version():
    """Show AgentFlow version"""
    from agentflow import __version__
    console.print(f"[bold blue]AgentFlow[/bold blue] v{__version__}")


if __name__ == "__main__":
    app()