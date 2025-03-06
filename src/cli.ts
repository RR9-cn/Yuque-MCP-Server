#!/usr/bin/env node
import { startServer } from './index';

// Set the environment to CLI mode
process.env.NODE_ENV = 'cli';

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});