"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.db = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = require("postgres");
const schema = require("./schema");
// Connection configuration
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// Create postgres.js client
const client = (0, postgres_1.default)(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});
// Create Drizzle instance
exports.db = (0, postgres_js_1.drizzle)(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
});
// Export the client for direct SQL queries if needed
exports.sql = client;
// Export schema for use in other files
__exportStar(require("./schema"), exports);
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    await client.end();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Closing database connection...');
    await client.end();
    process.exit(0);
});
