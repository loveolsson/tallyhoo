import express, { Application } from 'express';
import { Server as WSServer } from 'ws';
import { Server } from 'http';

export class HTTPServer {
  app: Application = express();
  ws: WSServer = new WSServer({ noServer: true });
  server: Server;
  connections = new Set<WebSocket>();

  constructor(port: number) {
    this.app.use(express.static('public'));

    this.server = this.app.listen(port, () => {
      console.log(`[server]: Server is running at https://localhost:${port}`);
    });

    this.server.on('upgrade', (request, socket, head) => {
      this.ws.handleUpgrade(request, socket, head, (socket) => {
        this.ws.emit('connection', socket, request);
      });
    });

    this.ws.addListener('connection', this.connection_open.bind(this));
  }

  connection_open(connection: WebSocket) {
    this.connections.add(connection);
    connection.addEventListener('close', this.connection_close.bind(this, connection));
    console.log(`Connected (${this.connections.size} connected)`);
  }

  connection_close(socket: WebSocket, ev: CloseEvent) {
    if (!this.connections.delete(socket)) {
      console.error('Tried to remove connection not in list');
    }

    console.log(`Disconnected (${this.connections.size} left)`);
  }

  broadcast(str: string) {
    const data = JSON.stringify(str);
    for (const con of this.connections) {
      try {
        con.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
