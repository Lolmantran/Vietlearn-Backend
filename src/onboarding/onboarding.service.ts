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

// Map frontend display labels → CEFR codes
const LEVEL_MAP: Record<string, string> = {
  'absolute beginner': 'A1',
  'beginner':          'A1',
  'elementary':        'A2',
  'intermediate':      'B1',
  'upper intermediate':'B2',
  'advanced':          'C1',
  // pass-through for already-correct CEFR codes
  'a1': 'A1', 'a2': 'A2', 'b1': 'B1', 'b2': 'B2', 'c1': 'C1', 'c2': 'C2',
};

// Map frontend goal labels → short keys stored in DB
const GOAL_MAP: Record<string, string> = {
  'travel':              'travel',
  'daily conversation':  'conversation',
  'business':            'business',
  'exam preparation':    'exam',
  'culture & media':     'culture',
  'heritage learner':    'heritage',
};

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  submitPlacementTest(answers: PlacementAnswerDto[]) {
    // Stub: pretend 60% of submitted answers are correct
    const score = Math.round((answers.length * 0.6) * 10);
    const entry = LEVEL_THRESHOLDS.find((t) => score >= t.minScore)!;
    return { estimatedLevel: entry.level, suggestedGoals: [] };
  }

  async setGoals(userId: string, dto: SetGoalsDto) {
    const normalizedLevel = LEVEL_MAP[dto.level.toLowerCase()] ?? dto.level.toUpperCase();
    const normalizedGoals = dto.goals.map((g) => GOAL_MAP[g.toLowerCase()] ?? g.toLowerCase());

    return this.prisma.user.update({
      where: { id: userId },
      data: { level: normalizedLevel, goals: normalizedGoals },
      select: { id: true, level: true, goals: true },
    });
  }
}
