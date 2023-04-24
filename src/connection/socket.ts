import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

class Socket {
  io: Server;

  constructor(private server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      jwt.verify(token, config.jwt.accessSecretKey, async (error: any, decoded: any) => {
        if (error) {
          return next(new Error('Authentication error'));
        }
        next();
      });
    });

    this.io.on('connection', () => {
      console.log('Socket client connected');
    });
  }
}

let socket: Socket;
export function initSocket(server: http.Server) {
  if (!socket) {
    socket = new Socket(server);
  }
}
export function getSocketIO() {
  if (!socket) {
    throw new Error('Please call init first');
  }
  return socket.io;
}
