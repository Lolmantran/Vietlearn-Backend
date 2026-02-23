import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlacementAnswerDto,
  SetGoalsDto,
} from './dto/onboarding.dto';

// Simple scoring: number of correct answers determines level
const LEVEL_THRESHOLDS: { minScore: number; level: string }[] = [
  { minScore: 90, level: 'B2' },
  { minScore: 70, level: 'B1' },
  { minScore: 50, level: 'A2' },
  { minScore: 0,  level: 'A1' },
];

const GOAL_SUGGESTIONS: Record<string, string[]> = {
  A1: ['Learn basic greetings', 'Numbers & colours', 'Daily common words'],
  A2: ['Food & travel vocabulary', 'Simple conversations'],
  B1: ['Business Vietnamese', 'Grammar patterns', 'Reading articles'],
  B2: ['Advanced listening', 'News comprehension', 'Writing practice'],
};

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  submitPlacementTest(answers: PlacementAnswerDto[]) {
    // Stub: pretend 60% of submitted answers are correct
    const score = Math.round((answers.length * 0.6) * 10);
    const entry = LEVEL_THRESHOLDS.find((t) => score >= t.minScore)!;
    const suggestedGoals = GOAL_SUGGESTIONS[entry.level] ?? [];
    return { estimatedLevel: entry.level, suggestedGoals };
  }

  async setGoals(userId: string, dto: SetGoalsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { level: dto.level, goals: dto.goals },
      select: { id: true, level: true, goals: true },
    });
  }
}
