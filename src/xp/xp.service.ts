import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class XpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Award XP to a user.
   * Handles daily reset, streak updates, and longestStreak.
   * Returns the actual amount awarded.
   */
  async addXp(userId: string, amount: number, _reason: string): Promise<number> {
    if (amount <= 0) return 0;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return 0;

    // Calendar day boundaries (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    // --- xpToday reset logic ---
    const lastXpDate = user.xpTodayDate ? new Date(user.xpTodayDate) : null;
    const isNewDay = !lastXpDate || lastXpDate < today;
    const newXpToday = isNewDay ? amount : user.xpToday + amount;

    // --- streak logic ---
    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    let newStreak = user.currentStreak;

    if (!lastActivity) {
      newStreak = 1;
    } else if (lastActivity >= today) {
      // Already active today — streak unchanged
    } else if (lastActivity >= yesterday) {
      // Active yesterday — extend streak
      newStreak += 1;
    } else {
      // Gap in activity — reset streak
      newStreak = 1;
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: { increment: amount },
        xpToday: newXpToday,
        xpTodayDate: today,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
      },
    });

    return amount;
  }
}
