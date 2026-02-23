import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SrsService, SrsRating } from '../srs/srs.service';
import { GetDeckDto } from './dto/get-deck.dto';
import { GenerateCustomDeckDto } from './dto/generate-custom-deck.dto';
import { DeckType } from '@prisma/client';

@Injectable()
export class VocabService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly srs: SrsService,
  ) {}

  async getDeck(dto: GetDeckDto) {
    const deckType = (dto.deckType?.toUpperCase() ?? undefined) as
      | DeckType
      | undefined;

    const [total, flashcards] = await Promise.all([
      this.prisma.flashcard.count({
        where: { deck: deckType ? { deckType } : undefined },
      }),
      this.prisma.flashcard.findMany({
        where: { deck: deckType ? { deckType } : undefined },
        skip: dto.skip,
        take: dto.limit,
        include: { deck: { select: { name: true, deckType: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      data: flashcards,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / (dto.limit ?? 20)),
    };
  }

  async getReviewQueue(userId: string) {
    const now = new Date();
    const reviews = await this.prisma.flashcardReview.findMany({
      where: { userId, nextReviewAt: { lte: now } },
      include: { flashcard: true },
      orderBy: { nextReviewAt: 'asc' },
      take: 50,
    });

    return reviews.map((r) => ({
      ...r.flashcard,
      reviewId: r.id,
      nextReviewAt: r.nextReviewAt,
      repetitions: r.repetitions,
    }));
  }

  async submitReview(
    userId: string,
    flashcardId: string,
    rating: SrsRating,
  ) {
    const existing = await this.prisma.flashcardReview.findUnique({
      where: { userId_flashcardId: { userId, flashcardId } },
    });

    const current = existing ?? {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };

    const next = this.srs.calculateNextReview(current, rating);

    const review = await this.prisma.flashcardReview.upsert({
      where: { userId_flashcardId: { userId, flashcardId } },
      create: {
        userId,
        flashcardId,
        ...next,
        lastRating: rating,
        reviewedAt: new Date(),
      },
      update: {
        ...next,
        lastRating: rating,
        reviewedAt: new Date(),
      },
    });

    // Update stats
    await this.prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalReviews: 1 },
      update: { totalReviews: { increment: 1 } },
    });

    return review;
  }

  async generateCustomDeck(userId: string, dto: GenerateCustomDeckDto) {
    const sourceText =
      dto.sourceText ?? (dto.words ? dto.words.join(', ') : '');

    const cards = await this.ai.generateFlashcardsFromText({
      text: sourceText,
      targetLanguage: 'vi',
    });

    const deck = await this.prisma.deck.create({
      data: {
        name: dto.deckName,
        deckType: 'CUSTOM',
        ownerId: userId,
        flashcards: {
          create: cards.map((c) => ({
            word: c.word,
            pronunciation: c.pronunciation,
            meaning: c.meaning,
            exampleSentence: c.exampleSentence,
          })),
        },
      },
      include: { flashcards: true },
    });

    return deck;
  }

  async findFlashcard(id: string) {
    const card = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Flashcard not found');
    return card;
  }
}
