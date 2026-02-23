import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ChatMessage } from '../ai/interfaces/ai.interfaces';
import { MessageRole } from '@prisma/client';

@Injectable()
export class TutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createOrFetchSession(userId: string, topic?: string) {
    // Reuse most recent active session for same topic
    const existing = await this.prisma.tutorSession.findFirst({
      where: { userId, topic: topic ?? null, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) return existing;

    return this.prisma.tutorSession.create({
      data: { userId, topic },
    });
  }

  async getSessionHistory(sessionId: string, userId: string, limit = 50) {
    const session = await this.prisma.tutorSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');

    return this.prisma.tutorMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async handleUserMessage(
    sessionId: string,
    userId: string,
    text: string,
  ) {
    const session = await this.prisma.tutorSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Persist user message
    await this.prisma.tutorMessage.create({
      data: { sessionId, role: MessageRole.USER, content: text },
    });

    // Build history for AI context (last 20 messages)
    const history = await this.prisma.tutorMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const sessionHistory: ChatMessage[] = history
      .reverse()
      .map((m) => ({
        role: m.role === MessageRole.USER ? 'user' : 'assistant',
        content: m.content,
      }));

    // Call AI
    const aiReply = await this.ai.chatReply({
      sessionHistory,
      userMessage: text,
      mode: 'free',
      level: user?.level ?? 'A1',
    });

    // Persist assistant message
    const assistantMsg = await this.prisma.tutorMessage.create({
      data: {
        sessionId,
        role: MessageRole.ASSISTANT,
        content: aiReply.text,
        metadata: {
          corrections: aiReply.corrections ?? [],
          suggestions: aiReply.suggestions ?? [],
        },
      },
    });

    // Touch session
    await this.prisma.tutorSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId,
      text: assistantMsg.content,
      corrections: aiReply.corrections,
      suggestions: aiReply.suggestions,
    };
  }
}
