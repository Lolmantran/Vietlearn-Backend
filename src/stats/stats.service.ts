import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } });

    const quizScores = await this.prisma.quizSession.findMany({
      where: { userId, isComplete: true },
      select: { score: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const avgScore =
      quizScores.length > 0
        ? Math.round(
            quizScores.reduce((s, q) => s + (q.score ?? 0), 0) /
              quizScores.length,
          )
        : 0;

    return {
      totalWords: stats?.totalWords ?? 0,
      totalReviews: stats?.totalReviews ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      quizPerformance: { averageScore: avgScore, totalQuizzes: quizScores.length },
    };
  }

  async getByTopic(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Group quiz sessions by date and correlate with user goals/topics
    const quizSessions = await this.prisma.quizSession.findMany({
      where: { userId, isComplete: true },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const topics = user?.goals ?? ['general'];
    return topics.map((topic) => ({
      topic,
      sessionsCount: quizSessions.length,
      averageScore:
        quizSessions.reduce((s, q) => s + (q.score ?? 0), 0) /
          (quizSessions.length || 1),
    }));
  }
}
