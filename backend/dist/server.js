"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const seed_1 = require("./config/seed");
const startServer = async () => {
    await (0, db_1.connectDatabase)();
    await (0, seed_1.seedDemoUsers)();
    await (0, seed_1.seedDemoProducts)();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`Marketplace API listening on port ${env_1.env.port}`);
    });
};
startServer().catch((error) => {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error('Server startup failed:', message);
    process.exit(1);
});
//# sourceMappingURL=server.js.map