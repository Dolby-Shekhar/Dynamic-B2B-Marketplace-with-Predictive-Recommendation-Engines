import app from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { seedDemoProducts, seedDemoUsers } from './config/seed';

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await seedDemoUsers();
  await seedDemoProducts();

  app.listen(env.port, () => {
    console.log(`Marketplace API listening on port ${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  console.error('Server startup failed:', message);
  process.exit(1);
});
