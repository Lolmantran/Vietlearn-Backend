import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SubmitQuizDto } from './dto/quiz.dto';
import { QuizQuestion } from '../ai/interfaces/ai.interfaces';

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async getDailyQuiz(userId: string) {
    // Return today's existing quiz if already generated
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const existing = await this.prisma.quizSession.findFirst({
      where: { userId, createdAt: { gte: startOfDay } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const questions = (existing.questions as unknown as QuizQuestion[]).map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ correctOptionId: _, ...q }) => q,
      );
      return { quizId: existing.id, questions, cached: true };
    }

    // Generate a new quiz for today
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const questions = await this.ai.generateQuiz({
      userLevel: user?.level ?? 'A1',
      topics: user?.goals ?? ['general'],
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

    let correct = 0;
    const detailedFeedback = dto.answers.map((a) => {
      const selectedId = a.selectedOptionId ?? a.userAnswer ?? '';
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question?.correctOptionId === selectedId;
      if (isCorrect) correct++;
      return {
        questionId: a.questionId,
        selectedOptionId: selectedId,
        correctOptionId: question?.correctOptionId ?? null,
        isCorrect,
        explanation: isCorrect
          ? 'Correct!'
          : `The correct answer was "${question?.options.find((o) => o.id === question.correctOptionId)?.text ?? '?'}"`,
      };
    });

    const score = Math.round((correct / questions.length) * 100);

    // Persist answers & mark complete
    await this.prisma.$transaction([
      this.prisma.quizAnswer.createMany({
        data: dto.answers.map((a) => ({
          quizSessionId: dto.quizId,
          questionId: a.questionId,
          selectedId: a.selectedOptionId ?? a.userAnswer ?? '',
          isCorrect:
            (questions.find((q) => q.id === a.questionId)?.correctOptionId ===
              (a.selectedOptionId ?? a.userAnswer ?? '')) === true,
        })),
      }),
      this.prisma.quizSession.update({
        where: { id: dto.quizId },
        data: { isComplete: true, score, feedback: detailedFeedback as object[] },
      }),
    ]);

    return { score, detailedFeedback };
  }
}
