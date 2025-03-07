import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YuqueMcpServer } from "./server";
import { getServerConfig } from "./config";

export async function startServer(): Promise<void> {
  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  const config = getServerConfig(isStdioMode);

  // 如果没有设置 API token，输出提示信息但不退出
  if (!config.yuqueApiToken) {
    console.warn("No Yuque API token provided in environment. You can:");
    console.warn("1. Set YUQUE_API_TOKEN in your .env file");
    console.warn("2. Provide accessToken via query parameter: ?accessToken=your_token");
    console.warn("Some API operations will fail without a valid token.");
  }

  const server = new YuqueMcpServer(config.yuqueApiToken || "", config.yuqueApiBaseUrl);

  if (isStdioMode) {
    console.log("Starting Yuque MCP Server in stdio mode...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Display available tools in stdio mode
    server.displayAvailableTools();
  } else {
    console.log(`Starting Yuque MCP Server in HTTP mode on port ${config.port}...`);
    await server.startHttpServer(config.port);
  }
}

// If this file is being run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

export * from './server';
export * from './services/yuque';