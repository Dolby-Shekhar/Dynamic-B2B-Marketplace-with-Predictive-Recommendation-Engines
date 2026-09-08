import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { env } from './env';

let memoryMongoServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (error: Error) => {
      console.error('MongoDB connection error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
    });

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 20,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.warn('Local MongoDB unavailable, starting in-memory instance:', message);

    memoryMongoServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryMongoServer.getUri(), {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 20,
    });
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();

  if (memoryMongoServer) {
    await memoryMongoServer.stop();
    memoryMongoServer = null;
  }
};
