import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const [stats, user, quizScores, wordsDueTodayCount] = await Promise.all([
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.quizSession.findMany({
        where: { userId, isComplete: true },
        select: { score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.flashcardReview.count({
        where: { userId, nextReviewAt: { lte: new Date() } },
      }),
    ]);

    const avgScore =
      quizScores.length > 0
        ? Math.round(
            quizScores.reduce((s, q) => s + (q.score ?? 0), 0) /
              quizScores.length,
          )
        : 0;

    const totalWords = stats?.totalWords ?? 0;
    const currentStreak = user?.currentStreak ?? stats?.currentStreak ?? 0;
    const longestStreak = user?.longestStreak ?? stats?.longestStreak ?? 0;

    return {
      totalWords,
      totalWordsLearned: totalWords,
      totalReviews: stats?.totalReviews ?? 0,
      wordsDueToday: wordsDueTodayCount,
      currentStreak,
      longestStreak,
      streakDays: currentStreak,
      xpToday: user?.xpToday ?? 0,
      xpTotal: user?.xpTotal ?? 0,
      minutesStudiedToday: 0,
      weeklyActivity: [],
      quizPerformance: { averageScore: avgScore, totalQuizzes: quizScores.length },
      nextRecommendedAction: null,
    };
  }

  async getByTopic(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const quizSessions = await this.prisma.quizSession.findMany({
      where: { userId, isComplete: true },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const topics = (user?.goals ?? []).length > 0 ? user!.goals : ['general'];

    return topics.map((topic) => {
      const totalAnswers = quizSessions.flatMap((q) => q.answers);
      const correct = totalAnswers.filter((a) => a.isCorrect).length;
      const accuracy =
        totalAnswers.length > 0
          ? Math.round((correct / totalAnswers.length) * 100)
          : 0;
      const lastSession = quizSessions[0];

      return {
        topic,
        wordsLearned: user ? (user as any).stats?.totalWords ?? 0 : 0,
        accuracy,
        lastStudied: lastSession?.createdAt ?? null,
        level: user?.level ?? 'A1',
      };
    });
  }
}
