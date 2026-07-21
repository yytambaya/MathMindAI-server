import { Server } from 'socket.io';
import { env } from '../config/env.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) socket.join(userId.toString());
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
