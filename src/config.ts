import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  port: z.coerce.number().default(3000),
  yuqueApiToken: z.string().optional(),
  yuqueApiBaseUrl: z.string().default('https://www.yuque.com/api/v2'),
});

export type ServerConfig = z.infer<typeof configSchema>;

export function getServerConfig(isStdioMode: boolean): ServerConfig {
  try {
    return configSchema.parse({
      port: process.env.PORT,
      yuqueApiToken: process.env.YUQUE_API_TOKEN,
      yuqueApiBaseUrl: process.env.YUQUE_API_BASE_URL,
    });
  } catch (error) {
    console.error('Invalid configuration:', error);
    process.exit(1);
  }
}