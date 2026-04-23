# Poetry 使用指南

## 什么是 Poetry？

Poetry 是一个用于 Python 项目的依赖管理和打包工具，它让你能够：
- 声明项目及其依赖
- 创建和管理虚拟环境
- 构建和发布包

## 安装 Poetry

Poetry 已安装到: `/Users/ddlowell/Library/Python/3.9/bin/poetry`

### 添加到 PATH（推荐）

在你的 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）中添加：

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
```

然后运行：
```bash
source ~/.zshrc  # 或 source ~/.bashrc
```

## 常用命令

### 项目初始化

```bash
# 在现有项目中初始化 Poetry（已配置）
poetry init --no-interaction

# 安装依赖
poetry install
```

### 依赖管理

```bash
# 添加依赖
poetry add fastapi
poetry add pytest --group dev

# 更新依赖
poetry update

# 查看依赖树
poetry show --tree
```

### 虚拟环境管理

```bash
# 激活虚拟环境
poetry shell

# 在虚拟环境中运行命令
poetry run python --version
poetry run pytest

# 查看虚拟环境路径
poetry env info --path
```

### 构建和发布

```bash
# 构建包
poetry build

# 发布到 PyPI
poetry publish
```

## 项目结构

AgentFlow 使用以下结构：

```
AgentFlow/
├── pyproject.toml        # Poetry 配置文件
├── poetry.lock           # 锁定的依赖版本（自动生成）
├── agentflow/            # 源代码
│   ├── __init__.py
│   ├── core/
│   ├── nodes/
│   └── ...
├── tests/                # 测试
└── examples/             # 示例
```

## 配置说明

### pyproject.toml 关键配置

```toml
[tool.poetry]
name = "agentflow"
version = "0.1.0"
description = "A scalable AI Agent workflow framework"

[tool.poetry.dependencies]
python = "^3.9"           # Python 版本要求

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"         # 开发依赖

[tool.poetry.scripts]
agentflow = "agentflow.cli.main:app"  # CLI 入口点

[tool.black]             # 代码格式化配置
line-length = 100
```

## 依赖版本说明

- `^3.9`: 兼容性版本（^3.9.0, 3.9.x, 3.10.x, ...）
- `~3.9`: 兼容性版本（~3.9.0, 3.9.x）
- `3.9.0`: 精确版本
- `*`: 任意版本（不推荐）

## 在 AgentFlow 中使用

### 安装项目依赖

```bash
cd /Users/ddlowell/Documents/projects/AgentFlow
poetry install
```

### 运行 AgentFlow CLI

```bash
# 激活虚拟环境
poetry shell

# 或直接运行
poetry run agentflow --help
```

### 运行测试

```bash
poetry run pytest
```

### 代码格式化

```bash
poetry run black agentflow/
poetry run isort agentflow/
```

## 故障排除

### 锁定文件冲突

如果 `poetry.lock` 与 `pyproject.toml` 不一致：

```bash
poetry lock --no-update
```

### 虚拟环境问题

删除并重建虚拟环境：

```bash
poetry env remove --all
poetry install
```

## 参考资料

- [Poetry 官方文档](https://python-poetry.org/docs/)
- [PyPI Poetry](https://pypi.org/project/poetry/)
- [Poetry GitHub](https://github.com/python-poetry/poetry)