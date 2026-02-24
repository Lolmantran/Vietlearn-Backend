import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { XpService } from '../xp/xp.service';
import { SubmitQuizDto } from './dto/quiz.dto';
import { QuizQuestion } from '../ai/interfaces/ai.interfaces';

const XP_PER_CORRECT = 10;

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly xp: XpService,
  ) {}

  async getDailyQuiz(userId: string) {
    // Return today's quiz only if it hasn't been submitted yet
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const existing = await this.prisma.quizSession.findFirst({
      where: { userId, isComplete: false, createdAt: { gte: startOfDay } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const questions = (existing.questions as unknown as QuizQuestion[]).map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ correctOptionId: _, ...q }) => q,
      );
      return { quizId: existing.id, questions, cached: true };
    }

    // Generate a fresh quiz
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const level = user?.level ?? 'A1';
    const topics = user?.goals ?? ['general'];

    // Random seed prevents the AI returning identical questions each call
    const seed = Math.floor(Math.random() * 100_000);
    const questions = await this.ai.generateQuiz({
      userLevel: level,
      topics,
      seed,
    });

    const session = await this.prisma.quizSession.create({
      data: { userId, questions: questions as object[] },
    });

    const sanitisedQuestions = questions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ correctOptionId: _, ...q }) => q,
    );

    return { quizId: session.id, questions: sanitisedQuestions, cached: false };
  }

  async submitQuiz(userId: string, dto: SubmitQuizDto) {
    const session = await this.prisma.quizSession.findFirst({
      where: { id: dto.quizId, userId, isComplete: false },
    });
    if (!session) throw new NotFoundException('Quiz not found or already completed');

    const questions = session.questions as unknown as QuizQuestion[];
    const totalQuestions = questions.length;

    let correct = 0;
    const detailedFeedback = dto.answers.map((a) => {
      const selectedId = a.selectedOptionId ?? a.userAnswer ?? '';
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = !!question && question.correctOptionId === selectedId;
      if (isCorrect) correct++;
      return {
        questionId: a.questionId,
        isCorrect,
        selectedOptionId: selectedId,
        correctOptionId: question?.correctOptionId ?? null,
        explanation: isCorrect
          ? 'Correct!'
          : `The correct answer was "${question?.options.find((o) => o.id === question.correctOptionId)?.text ?? '?'}"`,
      };
    });

    const totalPoints = totalQuestions * XP_PER_CORRECT;
    const percentage = totalQuestions > 0
      ? Math.round((correct / totalQuestions) * 100)
      : 0;

    // Award XP
    const xpEarned = await this.xp.addXp(
      userId,
      correct * XP_PER_CORRECT,
      'quiz_correct_answers',
    );
    await this.xp.addStudyTime(userId, 5); // ~5 min per quiz session

    // Persist answers & mark complete
    await this.prisma.$transaction([
      this.prisma.quizAnswer.createMany({
        data: dto.answers.map((a) => ({
          quizSessionId: dto.quizId,
          questionId: a.questionId,
          selectedId: a.selectedOptionId ?? a.userAnswer ?? '',
          isCorrect:
            !!questions.find((q) => q.id === a.questionId) &&
            questions.find((q) => q.id === a.questionId)!.correctOptionId ===
              (a.selectedOptionId ?? a.userAnswer ?? ''),
        })),
      }),
      this.prisma.quizSession.update({
        where: { id: dto.quizId },
        data: {
          isComplete: true,
          score: correct,
          feedback: detailedFeedback as object[],
        },
      }),
    ]);

    return {
      score: correct,
      totalPoints,
      percentage,
      xpEarned,
      timeSpentSeconds: 0,
      detailedFeedback,
    };
  }
}
