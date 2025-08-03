import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*', // Melhor para ambientes diferentes
    methods: ['GET', 'POST'],
    //credentials: true // Se precisar de autenticação
  },
  namespace: 'api/events', // Namespace mais específico
  pingInterval: 10000, // Intervalo de ping
  pingTimeout: 5000, // Timeout de conexão
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly connectedClients = new Map<string, { socket: Socket, upas: Set<string> }>();

  async handleConnection(client: Socket) {
    // Verificação de autenticação (opcional)
    try {
      // Exemplo: const token = client.handshake.auth.token;
      // await this.authService.verifyToken(token);
      
      this.connectedClients.set(client.id, {
        socket: client,
        upas: new Set()
      });
      
      this.logger.log(`Cliente conectado: ${client.id} (Total: ${this.connectedClients.size})`);
      
      client.emit('connection-status', {
        status: 'connected',
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Falha na conexão: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.upas.forEach(upaId => {
        client.leave(`upa-${upaId}`);
      });
      this.connectedClients.delete(client.id);
    }
    this.logger.log(`Cliente desconectado: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('subscribe-upa')
  handleSubscribeUpa(
    @MessageBody() data: { upaId: string },
    @ConnectedSocket() client: Socket
  ) {
    if (!data.upaId) {
      client.emit('error', { message: 'upaId é obrigatório' });
      return;
    }

    const clientData = this.connectedClients.get(client.id);
    if (!clientData) {
      client.emit('error', { message: 'Conexão não encontrada' });
      return;
    }

    const room = `upa-${data.upaId}`;
    client.join(room);
    clientData.upas.add(data.upaId);
    
    this.logger.log(`Cliente ${client.id} subscrito na UPA: ${data.upaId}`);
    
    client.emit('subscription-confirmed', {
      upaId: data.upaId,
      room,
      timestamp: new Date().toISOString(),
      subscribedUpas: Array.from(clientData.upas)
    });
  }

  @SubscribeMessage('unsubscribe-upa')
  handleUnsubscribeUpa(
    @MessageBody() data: { upaId: string },
    @ConnectedSocket() client: Socket
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData) return;

    const room = `upa-${data.upaId}`;
    client.leave(room);
    clientData.upas.delete(data.upaId);
    
    this.logger.log(`Cliente ${client.id} desinscrito da UPA: ${data.upaId}`);
    
    client.emit('unsubscription-confirmed', {
      upaId: data.upaId,
      timestamp: new Date().toISOString(),
      remainingSubscriptions: Array.from(clientData.upas)
    });
  }

  emitQueueUpdate(upaId: string, queueData: any) {
    const updateData = {
      upa_id: upaId,
      data: queueData,
      timestamp: new Date().toISOString(),
    };

    // Emitir apenas para a sala específica (mais eficiente)
    this.server.to(`upa-${upaId}`).emit('upa-specific-update', updateData);
    
    this.logger.log(`Atualização enviada para UPA ${upaId} (${this.getRoomSize(`upa-${upaId}`)} clientes)`);
  }

  emitGlobalUpdate(allUpasData: any) {
    const updateData = {
      upas: allUpasData,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('global-update', updateData);
    this.logger.log(`Atualização global enviada para ${this.connectedClients.size} clientes`);
  }

  private getRoomSize(room: string): number {
    return this.server.sockets.adapter.rooms.get(room)?.size || 0;
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Novo: Método para listar UPAs ativas com contagem de inscritos
  getActiveUpas() {
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