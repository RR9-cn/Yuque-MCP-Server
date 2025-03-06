# Yuque MCP Server

A Model-Context-Protocol (MCP) server for integrating with Yuque's API. This implementation is inspired by [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) and uses the [Yuque Open API](https://app.swaggerhub.com/apis-docs/Jeff-Tian/yuque-open_api/2.0.1).

## Overview

This server provides MCP tools for interacting with Yuque's knowledge base platform, allowing AI models to:

- Fetch user and document information
- Create, read, update, and delete documents
- Search content within Yuque
- Retrieve repository information

## Installation

### Prerequisites

- Node.js 18+ (recommended)
- Yuque account with API token

### Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/Yueque-MCP-Server.git
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

4. Add your Yuque API token to the `.env` file:
   ```
   YUQUE_API_TOKEN=your_yuque_api_token_here
   ```

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

### MCP Tools

The Yuque MCP Server provides the following tools:

- `get_current_user` - 获取当前认证用户的信息，包括用户ID、用户名、头像等语雀账号基本信息
- `get_user_docs` - 获取当前用户的所有知识库文档列表，包括私人和协作文档
- `get_user_repos` - 获取指定用户的知识库列表，知识库是语雀中组织文档的集合
- `get_repo_docs` - 获取特定知识库中的所有文档列表，包括文档标题、更新时间等信息
- `get_doc` - 获取语雀中特定文档的详细内容，包括正文、修改历史和权限信息
- `create_doc` - 在指定知识库中创建新的语雀文档，支持Markdown格式内容
- `update_doc` - 更新语雀中已存在的文档，可以修改标题、内容或权限设置
- `delete_doc` - 从语雀知识库中删除指定文档，此操作不可撤销
- `search` - 在语雀平台中搜索内容，可以按不同类型筛选搜索结果

## Integration with AI Models

This MCP server can be used with AI models that support the Model-Context-Protocol, allowing them to interact with Yuque through defined tools. For example:

1. Start the MCP server
2. Connect to the server from a compatible client
3. The AI model can now use the registered tools to interact with Yuque data

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

## License

ISC

## Acknowledgements

- [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) for the MCP server implementation
- [Yuque Open API](https://app.swaggerhub.com/apis-docs/Jeff-Tian/yuque-open_api/2.0.1) for API documentation
- [Model Context Protocol](https://github.com/anthropics/model-context-protocol) for the MCP specification