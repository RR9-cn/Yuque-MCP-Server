import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YuqueMcpServer } from "./server";
import { getServerConfig } from "./config";

export async function startServer(): Promise<void> {
  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  const config = getServerConfig(isStdioMode);

  if (!config.yuqueApiToken) {
    console.error("Yuque API token is required. Please set YUQUE_API_TOKEN in your environment variables or .env file.");
    process.exit(1);
  }

  const server = new YuqueMcpServer(config.yuqueApiToken, config.yuqueApiBaseUrl);

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