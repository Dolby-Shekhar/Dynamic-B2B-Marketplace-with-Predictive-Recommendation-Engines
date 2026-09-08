"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_1 = require("./env");
let memoryMongoServer = null;
const connectDatabase = async () => {
    try {
        mongoose_1.default.set('strictQuery', true);
        mongoose_1.default.connection.on('connected', () => {
            console.log('MongoDB connected successfully.');
        });
        mongoose_1.default.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error.message);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected.');
        });
        await mongoose_1.default.connect(env_1.env.mongoUri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 20,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown database error';
        console.warn('Local MongoDB unavailable, starting in-memory instance:', message);
        memoryMongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        await mongoose_1.default.connect(memoryMongoServer.getUri(), {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 20,
        });
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.disconnect();
    if (memoryMongoServer) {
        await memoryMongoServer.stop();
        memoryMongoServer = null;
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=db.js.map