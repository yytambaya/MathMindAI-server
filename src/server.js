import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './sockets/index.js';

async function start() {
  await connectDB();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(env.port, () => {
    console.log(`MathMind AI server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
