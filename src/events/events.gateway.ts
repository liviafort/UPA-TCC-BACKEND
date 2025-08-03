import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'ws/api/events',
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly connectedClients = new Map<string, { socket: Socket; upas: Set<string> }>();
  private isServerReady = false;

  afterInit(server: Server) {
    this.server = server;
    this.isServerReady = true;
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      this.connectedClients.set(client.id, {
        socket: client,
        upas: new Set(),
      });

      this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);

      client.emit('connection-status', {
        status: 'connected',
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.upas.forEach((upaId) => {
        client.leave(`upa-${upaId}`);
      });
      this.connectedClients.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('subscribe-upa')
  handleSubscribeUpa(
    @MessageBody() data: { upaId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.upaId) {
      client.emit('error', { message: 'upaId is required' });
      return;
    }

    const clientData = this.connectedClients.get(client.id);
    if (!clientData) {
      client.emit('error', { message: 'Connection not found' });
      return;
    }

    const room = `upa-${data.upaId}`;
    client.join(room);
    clientData.upas.add(data.upaId);

    this.logger.log(`Client ${client.id} subscribed to UPA: ${data.upaId}`);

    client.emit('subscription-confirmed', {
      upaId: data.upaId,
      room,
      timestamp: new Date().toISOString(),
      subscribedUpas: Array.from(clientData.upas),
    });
  }

  @SubscribeMessage('unsubscribe-upa')
  handleUnsubscribeUpa(
    @MessageBody() data: { upaId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData) return;

    const room = `upa-${data.upaId}`;
    client.leave(room);
    clientData.upas.delete(data.upaId);

    this.logger.log(`Client ${client.id} unsubscribed from UPA: ${data.upaId}`);

    client.emit('unsubscription-confirmed', {
      upaId: data.upaId,
      timestamp: new Date().toISOString(),
      remainingSubscriptions: Array.from(clientData.upas),
    });
  }

  emitQueueUpdate(upaId: string, queueData: any) {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('Server not ready, skipping queue update');
      return;
    }

    const updateData = {
      upa_id: upaId,
      data: queueData,
      timestamp: new Date().toISOString(),
    };

    const room = `upa-${upaId}`;
    this.server.to(room).emit('upa-specific-update', updateData);

    const clientCount = this.getRoomSize(room);
    this.logger.log(`Update sent to UPA ${upaId} (${clientCount} clients)`);
  }

  emitGlobalUpdate(allUpasData: any) {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('Server not ready, skipping global update');
      return;
    }

    const updateData = {
      upas: allUpasData,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('global-update', updateData);
    this.logger.log(`Global update sent to ${this.connectedClients.size} clients`);
  }

  private getRoomSize(room: string): number {
    try {
      if (!this.server?.sockets?.adapter?.rooms) {
        return 0;
      }
      return this.server.sockets.adapter.rooms.get(room)?.size || 0;
    } catch (error) {
      this.logger.error(`Error getting room size: ${error.message}`);
      return 0;
    }
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getActiveUpas() {
    if (!this.server?.sockets?.adapter?.rooms) {
      return {};
    }

    const rooms = this.server.sockets.adapter.rooms;
    const upas = new Map<string, number>();

    rooms.forEach((_, roomName) => {
      if (roomName.startsWith('upa-')) {
        upas.set(roomName.replace('upa-', ''), rooms.get(roomName)?.size || 0);
      }
    });

    return Object.fromEntries(upas);
  }
}