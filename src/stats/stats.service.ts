import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const [stats, user, quizScores, wordsDueTodayCount, recentQuizzes, recentReviews, recentMessages] =
      await Promise.all([
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
        // Last 7 days of completed quiz sessions
        this.prisma.quizSession.findMany({
          where: { userId, isComplete: true, createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
        // Last 7 days of flashcard reviews
        this.prisma.flashcardReview.findMany({
          where: { userId, reviewedAt: { gte: sevenDaysAgo } },
          select: { reviewedAt: true },
        }),
        // Last 7 days of user tutor messages
        this.prisma.tutorMessage.findMany({
          where: { session: { userId }, role: MessageRole.USER, createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
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

    // Build weeklyActivity: last 7 days oldest → newest
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sevenDaysAgo);
      day.setUTCDate(day.getUTCDate() + i);
      const nextDay = new Date(day);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const dateStr = day.toISOString().split('T')[0];
      const isToday = day.getTime() === todayUTC.getTime();

      // For today, use the authoritative minutesStudiedToday counter so the
      // chart bar and the "X min today" header always show the same value.
      if (isToday) {
        return { date: dateStr, minutes: user?.minutesStudiedToday ?? 0 };
      }

      const quizMin = recentQuizzes.filter(
        (q) => q.createdAt >= day && q.createdAt < nextDay,
      ).length * 5;
      const reviewMin = recentReviews.filter(
        (r) => r.reviewedAt >= day && r.reviewedAt < nextDay,
      ).length;
      const tutorMin = recentMessages.filter(
        (m) => m.createdAt >= day && m.createdAt < nextDay,
      ).length;

      return {
        date: dateStr,
        minutes: quizMin + reviewMin + tutorMin,
      };
    });

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
      minutesStudiedToday: user?.minutesStudiedToday ?? 0,
      weeklyActivity,
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
