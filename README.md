# Yuque MCP Server

A Model-Context-Protocol (MCP) server for integrating with Yuque's API. This implementation is inspired by [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) and uses the [Yuque Open API](https://app.swaggerhub.com/apis-docs/Jeff-Tian/yuque-open_api/2.0.1).

## Overview

This server provides MCP tools for interacting with Yuque's knowledge base platform, allowing AI models to:

- 获取用户和文档信息
- 创建、读取、更新和删除文档
- 搜索语雀中的内容
- 获取知识库信息
- 获取统计数据和分析信息

## Installation

### Prerequisites

- Node.js 18+ (recommended)
- Yuque account with API token

### Setup

1. Clone this repository:
   ```
   git clone https://github.com/Henryhaoson/Yueque-MCP-Server.git
   cd Yueque-MCP-Server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example`:
   ```
   cp .env.example .env
   ```

4. (可选) 在 `.env` 文件中添加你的语雀 API token：
   ```
   YUQUE_API_TOKEN=your_yuque_api_token_here
   ```
   
   你也可以选择在连接到服务器时通过查询参数提供 token，而不是在 .env 文件中设置。

## Usage

### Running the Server

#### Development Mode

```bash
# HTTP server mode
npm run dev

# CLI stdio mode
npm run dev:cli
```

#### Production Mode

First, build the project:

```bash
npm run build
```

Then run in either HTTP or CLI mode:

```bash
# HTTP server mode
npm run start

# CLI stdio mode
npm run start:cli
```

### 使用 Docker 部署

本项目提供了 Docker 支持，使您可以轻松地容器化和部署服务器。

#### 使用 Docker Compose（推荐）

1. 构建并启动容器：
   ```bash
   docker-compose up -d
   ```

2. 查看日志：
   ```bash
   docker-compose logs -f
   ```

3. 停止服务：
   ```bash
   docker-compose down
   ```

您可以通过环境变量或在 `.env` 文件中设置配置项：
```bash
# .env 文件示例
PORT=3000
YUQUE_API_TOKEN=your_token_here
YUQUE_API_BASE_URL=https://www.yuque.com/api/v2
```

#### 手动使用 Docker

1. 构建 Docker 镜像：
   ```bash
   docker build -t yuque-mcp-server .
   ```

2. 运行容器：
   ```bash
   docker run -d -p 3000:3000 --name yuque-mcp-server yuque-mcp-server
   ```

3. 使用环境变量：
   ```bash
   docker run -d -p 3000:3000 \
     -e YUQUE_API_TOKEN=your_token_here \
     -e YUQUE_API_BASE_URL=https://www.yuque.com/api/v2 \
     --name yuque-mcp-server yuque-mcp-server
   ```

### MCP Tools

The Yuque MCP Server provides the following tools:

#### 用户和文档管理
- `get_current_user` - 获取当前认证用户的信息，包括用户ID、用户名、头像等语雀账号基本信息
- `get_user_docs` - 获取当前用户的所有知识库文档列表，包括私人和协作文档
- `get_user_repos` - 获取指定用户的知识库列表，知识库是语雀中组织文档的集合
- `get_repo_docs` - 获取特定知识库中的所有文档列表，包括文档标题、更新时间等信息
- `get_doc` - 获取语雀中特定文档的详细内容，包括正文、修改历史和权限信息
- `create_doc` - 在指定知识库中创建新的语雀文档，支持多种格式内容（Markdown、HTML、Lake）
- `update_doc` - 更新语雀中已存在的文档，可以修改标题、内容或权限设置
- `delete_doc` - 从语雀知识库中删除指定文档，此操作不可撤销
- `search` - 在语雀平台中搜索文档或知识库内容，支持范围和作者筛选

#### 团队统计分析
- `get_group_statistics` - 获取团队的汇总统计数据，包括成员人数、文档数量、阅读量和互动数据等
- `get_group_member_statistics` - 获取团队成员的统计数据，包括各成员的编辑次数、阅读量、点赞量等
- `get_group_book_statistics` - 获取团队知识库的统计数据，包括各知识库的文档数、字数、阅读量等
- `get_group_doc_statistics` - 获取团队文档的统计数据，包括各文档的字数、阅读量、评论量等

## Integration with AI Models

This MCP server can be used with AI models that support the Model-Context-Protocol, allowing them to interact with Yuque through defined tools. For example:

1. Start the MCP server
2. Connect to the server from a compatible client
3. The AI model can now use the registered tools to interact with Yuque data

### Query Parameters for SSE Endpoint

当连接到 SSE 端点时，你可以通过查询参数（query parameters）覆盖环境配置，这些参数的优先级高于环境变量：

- `accessToken`: 覆盖在 .env 文件中设置的语雀 API 令牌
- `baseUrl`: 覆盖在 .env 文件中设置的语雀 API 基础 URL

示例：
```
http://localhost:3000/sse?accessToken=your_token_here&baseUrl=https://custom.yuque.api/v2
```

这允许你在不修改 .env 文件的情况下动态配置服务，并且查询参数的优先级高于环境变量。这对于多用户环境或测试不同 API 端点特别有用。

每个 SSE 连接都可以使用不同的配置，这使得同一个服务器实例可以同时为不同的用户或环境提供服务。

## Development

### Project Structure

```
src/
  ├── config.ts          # Server configuration
  ├── index.ts           # Main entry point
  ├── cli.ts             # CLI entry point 
  ├── server.ts          # MCP server implementation
  └── services/
      └── yuque.ts       # Yuque API service
```

### Adding New Tools

To add a new tool, modify the `registerTools` method in `src/server.ts`.

## API 改进

最近的更新增加了以下功能：

1. **团队统计数据**：添加了获取团队、成员、知识库和文档统计数据的功能，便于分析和监控团队知识库的使用情况。

2. **文档管理增强**：
   - 支持多种文档格式（Markdown、HTML、Lake）
   - 完善的文档公开性设置（私密、公开、企业内公开）
   - 搜索功能支持更多参数和过滤条件

3. **数据类型完善**：更新了接口定义，使其与语雀 OpenAPI 规范保持一致。

## License

ISC

## Acknowledgements

- [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) for the MCP server implementation
- [Yuque Open API](https://app.swaggerhub.com/apis-docs/Jeff-Tian/yuque-open_api/2.0.1) for API documentation
- [Model Context Protocol](https://github.com/anthropics/model-context-protocol) for the MCP specification