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

  async getSessions(userId: string) {
    return this.prisma.tutorSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    });
  }

  async createOrFetchSession(
    userId: string,
    topic?: string,
    mode: string = 'free',
    level: string = 'A1',
  ) {
    // Normalize frontend mode strings to backend modes
    const modeMap: Record<string, string> = {
      explain: 'explain',
      explain_everything: 'explain',
      'explain everything': 'explain',
      correct: 'correct',
      correct_a_lot: 'correct',
      'correct me a lot': 'correct',
      free: 'free',
      chat: 'free',
      just_chat: 'free',
      'just chat': 'free',
    };
    const normalizedMode = modeMap[mode?.toLowerCase()] ?? 'free';
    // Reuse most recent active session for same topic + mode
    const existing = await this.prisma.tutorSession.findFirst({
      where: { userId, topic: topic ?? null, mode: normalizedMode, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) return existing;

    return this.prisma.tutorSession.create({
      data: { userId, topic, mode: normalizedMode, level },
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
      mode: (session.mode as 'explain' | 'correct' | 'free') ?? 'free',
      level: session.level ?? user?.level ?? 'A1',
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
