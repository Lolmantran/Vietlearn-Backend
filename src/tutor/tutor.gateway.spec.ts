import { Test, TestingModule } from '@nestjs/testing';
import { TutorGateway } from './tutor.gateway';
import { TutorService } from './tutor.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Socket } from 'socket.io';

// Minimal mocks
const mockTutorService = {
  handleUserMessage: jest.fn().mockResolvedValue({
    sessionId: 'sess1',
    text: 'AI reply stub',
    corrections: [],
    suggestions: [],
  }),
};

const mockJwtService = {
  verify: jest.fn().mockReturnValue({ sub: 'user1' }),
};

const mockPrismaService = {
  user: { findUnique: jest.fn().mockResolvedValue({ id: 'user1', level: 'A1' }) },
};

describe('TutorGateway', () => {
  let gateway: TutorGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorGateway,
        { provide: TutorService, useValue: mockTutorService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    gateway = module.get<TutorGateway>(TutorGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('handles user_message and calls TutorService', async () => {
    const mockClient = {
      userId: 'user1',
      emit: jest.fn(),
    } as unknown as { userId: string } & Socket;

    await gateway.handleUserMessage(mockClient as any, {
      sessionId: 'sess1',
      text: 'Xin chào',
    });

    expect(mockTutorService.handleUserMessage).toHaveBeenCalledWith(
      'sess1',
      'user1',
      'Xin chào',
    );
    expect(mockClient.emit).toHaveBeenCalledWith(
      'assistant_message',
      expect.objectContaining({ sessionId: 'sess1', text: 'AI reply stub' }),
    );
  });

  it('disconnects unauthenticated connections', async () => {
    const mockClient = {
      handshake: { auth: {}, query: {} },
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(mockClient);
    expect(mockClient.disconnect).toHaveBeenCalledWith(true);
  });
});
