import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({ namespace: '/ws/tutor', cors: { origin: '*' } })
export class TutorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TutorGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tutorService: TutorService,
  ) {}

  // ── Connection lifecycle ─────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth['token'] as string) ||
        (client.handshake.query['token'] as string);

      if (!token) throw new Error('Missing token');

      const payload = this.jwtService.verify<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new Error('User not found');

      (client as AuthenticatedSocket).userId = user.id;
      this.logger.log(`Client connected: ${client.id} (userId=${user.id})`);
    } catch (err) {
      this.logger.warn(`Unauthorized WS connection: ${(err as Error).message}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── Events ───────────────────────────────────

  @SubscribeMessage('user_message')
  async handleUserMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { sessionId: string; text: string },
  ) {
    if (!client.userId) throw new WsException('Unauthorized');

    const { sessionId, text } = payload;
    if (!sessionId || !text) throw new WsException('sessionId and text are required');

    try {
      const reply = await this.tutorService.handleUserMessage(
        sessionId,
        client.userId,
        text,
      );

      client.emit('assistant_message', reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      client.emit('error', { message });
    }
  }
}
