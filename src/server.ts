import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { YuqueService } from "./services/yuque";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export const Logger = {
  log: (...args: any[]) => {},
  error: (...args: any[]) => {},
};

export class YuqueMcpServer {
  private readonly server: McpServer;
  private readonly yuqueService: YuqueService;
  private sseTransport: SSEServerTransport | null = null;

  constructor(yuqueApiToken: string, yuqueApiBaseUrl: string) {
    this.yuqueService = new YuqueService(yuqueApiToken, yuqueApiBaseUrl);
    this.server = new McpServer(
      {
        name: "Yuque MCP Server",
        version: "0.1.0",
      },
      {
        capabilities: {
          logging: {},
          tools: {},
        },
      },
    );

    this.registerTools();
  }

  private registerTools(): void {
    // Tool to get current user information
    this.server.tool(
      "get_current_user",
      "获取当前认证用户的信息，包括用户ID、用户名、头像等语雀账号基本信息",
      {},
      async () => {
        try {
          Logger.log("Fetching current user information");
          const user = await this.yuqueService.getCurrentUser();
          
          Logger.log(`Successfully fetched user: ${user.name}`);
          Logger.log(JSON.stringify(user) );
          return {
            content: [{ type: "text", text: JSON.stringify(user) }],
          };
        } catch (error) {
          Logger.error("Error fetching current user:", error);
          return {
            content: [{ type: "text", text: `Error fetching current user: ${error}` }],
          };
        }
      },
    );

    // Tool to get user's docs
    this.server.tool(
      "get_user_docs",
      "获取当前用户的所有知识库文档列表，包括私人和协作文档",
      {},
      async () => {
        try {
          Logger.log("Fetching user's documents");
          const docs = await this.yuqueService.getUserDocs();
          
          Logger.log(`Successfully fetched ${docs.length} documents`);
          return {
            content: [{ type: "text", text: JSON.stringify(docs) }],
          };
        } catch (error) {
          Logger.error("Error fetching user docs:", error);
          return {
            content: [{ type: "text", text: `Error fetching user docs: ${error}` }],
          };
        }
      },
    );

    // Tool to get user's repos
    this.server.tool(
      "get_user_repos",
      "获取指定用户的知识库列表，知识库是语雀中组织文档的集合",
      {
        login: z.string().describe("用户的登录名或唯一标识"),
      },
      async ({ login }) => {
        try {
          Logger.log(`Fetching repositories for user: ${login}`);
          const repos = await this.yuqueService.getUserRepos(login);
          
          Logger.log(`Successfully fetched ${repos.length} repositories`);
          return {
            content: [{ type: "text", text: JSON.stringify(repos, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error fetching repos for user ${login}:`, error);
          return {
            content: [{ type: "text", text: `Error fetching repos: ${error}` }],
          };
        }
      },
    );

    // Tool to get docs in a repo
    this.server.tool(
      "get_repo_docs",
      "获取特定知识库中的所有文档列表，包括文档标题、更新时间等信息",
      {
        namespace: z.string().describe("知识库的命名空间，格式为 user/repo"),
      },
      async ({ namespace }) => {
        try {
          Logger.log(`Fetching documents for repository: ${namespace}`);
          const docs = await this.yuqueService.getRepoDocs(namespace);
          
          Logger.log(`Successfully fetched ${docs.length} documents`);
          return {
            content: [{ type: "text", text: JSON.stringify(docs, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error fetching docs for repo ${namespace}:`, error);
          return {
            content: [{ type: "text", text: `Error fetching docs: ${error}` }],
          };
        }
      },
    );

    // Tool to get a specific document
    this.server.tool(
      "get_doc",
      "获取语雀中特定文档的详细内容，包括正文、修改历史和权限信息",
      {
        namespace: z.string().describe("知识库的命名空间，格式为 user/repo"),
        slug: z.string().describe("文档的唯一标识或短链接名称"),
      },
      async ({ namespace, slug }) => {
        try {
          Logger.log(`Fetching document ${slug} from repository: ${namespace}`);
          const doc = await this.yuqueService.getDoc(namespace, slug);
          
          Logger.log(`Successfully fetched document: ${doc.title}`);
          return {
            content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error fetching doc ${slug} from repo ${namespace}:`, error);
          return {
            content: [{ type: "text", text: `Error fetching doc: ${error}` }],
          };
        }
      },
    );

    // Tool to create a new document
    this.server.tool(
      "create_doc",
      "在指定知识库中创建新的语雀文档，支持Markdown格式内容",
      {
        namespace: z.string().describe("知识库的命名空间，格式为 user/repo"),
        title: z.string().describe("文档标题"),
        slug: z.string().describe("文档的短链接名称，用于URL路径"),
        body: z.string().describe("文档内容，支持Markdown格式"),
        isPublic: z.boolean().default(true).describe("是否公开文档，默认为公开(true)"),
      },
      async ({ namespace, title, slug, body, isPublic }) => {
        try {
          Logger.log(`Creating document "${title}" in repository: ${namespace}`);
          const doc = await this.yuqueService.createDoc(namespace, title, slug, body, isPublic);
          
          Logger.log(`Successfully created document: ${doc.title}`);
          return {
            content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error creating doc in repo ${namespace}:`, error);
          return {
            content: [{ type: "text", text: `Error creating doc: ${error}` }],
          };
        }
      },
    );

    // Tool to update a document
    this.server.tool(
      "update_doc",
      "更新语雀中已存在的文档，可以修改标题、内容或权限设置",
      {
        namespace: z.string().describe("知识库的命名空间，格式为 user/repo"),
        id: z.number().describe("要更新的文档ID"),
        title: z.string().optional().describe("文档的新标题"),
        slug: z.string().optional().describe("文档的新短链接名称"),
        body: z.string().optional().describe("文档的新内容，支持Markdown格式"),
        isPublic: z.boolean().optional().describe("文档的公开状态，true为公开"),
      },
      async ({ namespace, id, title, slug, body, isPublic }) => {
        try {
          Logger.log(`Updating document ${id} in repository: ${namespace}`);
          const doc = await this.yuqueService.updateDoc(namespace, id, title, slug, body, isPublic);
          
          Logger.log(`Successfully updated document: ${doc.title}`);
          return {
            content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error updating doc ${id} in repo ${namespace}:`, error);
          return {
            content: [{ type: "text", text: `Error updating doc: ${error}` }],
          };
        }
      },
    );

    // Tool to delete a document
    this.server.tool(
      "delete_doc",
      "从语雀知识库中删除指定文档，此操作不可撤销",
      {
        namespace: z.string().describe("知识库的命名空间，格式为 user/repo"),
        id: z.number().describe("要删除的文档ID"),
      },
      async ({ namespace, id }) => {
        try {
          Logger.log(`Deleting document ${id} from repository: ${namespace}`);
          await this.yuqueService.deleteDoc(namespace, id);
          
          Logger.log(`Successfully deleted document ${id}`);
          return {
            content: [{ type: "text", text: `Document ${id} has been successfully deleted` }],
          };
        } catch (error) {
          Logger.error(`Error deleting doc ${id} from repo ${namespace}:`, error);
          return {
            content: [{ type: "text", text: `Error deleting doc: ${error}` }],
          };
        }
      },
    );

    // Tool to search Yuque content
    this.server.tool(
      "search",
      "在语雀平台中搜索内容，可以按不同类型筛选搜索结果",
      {
        query: z.string().describe("搜索关键词"),
        type: z.string().optional().describe("要搜索的内容类型，可选值包括：doc(文档)、book(知识库)、user(用户)、group(团队)"),
      },
      async ({ query, type }) => {
        try {
          Logger.log(`Searching for: ${query} with type: ${type || 'all'}`);
          const results = await this.yuqueService.search(query, type);
          
          Logger.log(`Successfully found ${results.length} results`);
          return {
            content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
          };
        } catch (error) {
          Logger.error(`Error searching for ${query}:`, error);
          return {
            content: [{ type: "text", text: `Error searching: ${error}` }],
          };
        }
      },
    );
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);

    Logger.log = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "info",
        data: args,
      });
    };
    
    Logger.error = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "error",
        data: args,
      });
    };

    Logger.log("Yuque MCP Server connected and ready to process requests");
  }

  // Display available tools to the console
  displayAvailableTools(): void {
    // 手动定义工具列表，因为我们不能直接访问 server.tools
    const tools = [
      { name: "get_current_user", description: "获取当前认证用户的信息，包括用户ID、用户名、头像等语雀账号基本信息" },
      { name: "get_user_docs", description: "获取当前用户的所有知识库文档列表，包括私人和协作文档" },
      { name: "get_user_repos", description: "获取指定用户的知识库列表，知识库是语雀中组织文档的集合" },
      { name: "get_repo_docs", description: "获取特定知识库中的所有文档列表，包括文档标题、更新时间等信息" },
      { name: "get_doc", description: "获取语雀中特定文档的详细内容，包括正文、修改历史和权限信息" },
      { name: "create_doc", description: "在指定知识库中创建新的语雀文档，支持Markdown格式内容" },
      { name: "update_doc", description: "更新语雀中已存在的文档，可以修改标题、内容或权限设置" },
      { name: "delete_doc", description: "从语雀知识库中删除指定文档，此操作不可撤销" },
      { name: "search", description: "在语雀平台中搜索内容，可以按不同类型筛选搜索结果" }
    ];
    
    console.log('\n======== 语雀 MCP 服务器可用工具 ========');
    console.log('以下工具可用于与语雀知识库交互：');
    console.log('----------------------------------------');
    
    tools.forEach(tool => {
      console.log(`\n• ${tool.name}`);
      console.log(`  ${tool.description}`);
    });
    
    console.log('\n========================================\n');
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    app.get("/sse", async (req: Request, res: Response) => {
      console.log("New SSE connection established");
      
      // 获取 query 参数中的 accessToken 和 baseUrl
      const queryAccessToken = req.query.accessToken as string | undefined;
      const queryBaseUrl = req.query.baseUrl as string | undefined;
      
      // 如果提供了 query 参数，更新 Yuque 服务配置
      if (queryAccessToken || queryBaseUrl) {
        console.log(`Using custom configuration: ${queryAccessToken ? 'Token from query, ' : ''}${queryBaseUrl ? 'BaseUrl from query' : ''}`);
        
        // 更新服务配置
        this.yuqueService.updateConfig(queryAccessToken, queryBaseUrl);
      }
      
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>,
      );
      await this.server.connect(this.sseTransport);
    });

    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        res.status(400).send("SSE connection not established");
        return;
      }
      await this.sseTransport.handlePostMessage(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse<IncomingMessage>,
      );
    });

    Logger.log = console.log;
    Logger.error = console.error;

    app.listen(port, () => {
      Logger.log(`Yuque MCP HTTP server listening on port ${port}`);
      Logger.log(`SSE endpoint available at http://localhost:${port}/sse`);
      Logger.log(`Message endpoint available at http://localhost:${port}/messages`);
      
      // Display available tools
      this.displayAvailableTools();
    });
  }
}