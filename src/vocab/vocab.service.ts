import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SrsService, SrsRating } from '../srs/srs.service';
import { XpService } from '../xp/xp.service';
import { GetDeckDto } from './dto/get-deck.dto';
import { GenerateCustomDeckDto } from './dto/generate-custom-deck.dto';
import { DeckType } from '@prisma/client';

const XP_PER_GOOD_REVIEW = 5;

@Injectable()
export class VocabService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly srs: SrsService,
    private readonly xp: XpService,
  ) {}

  // ── GET /vocab/decks ───────────────────────────────────────────────────────
  async getDecks(userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { OR: [{ ownerId: null }, { ownerId: userId }] },
      include: { _count: { select: { flashcards: true } } },
      orderBy: [{ deckType: 'asc' }, { name: 'asc' }],
    });

    const cardDeckMap = await this.prisma.flashcard.findMany({
      where: { deckId: { in: decks.map((d) => d.id) } },
      select: { id: true, deckId: true },
    });

    const enrolledReviews = await this.prisma.flashcardReview.findMany({
      where: { userId, flashcardId: { in: cardDeckMap.map((c) => c.id) } },
      select: { flashcardId: true },
    });

    const enrolledIds = new Set(enrolledReviews.map((r) => r.flashcardId));
    const enrolledByDeck: Record<string, number> = {};
    for (const card of cardDeckMap) {
      if (enrolledIds.has(card.id)) {
        enrolledByDeck[card.deckId] = (enrolledByDeck[card.deckId] ?? 0) + 1;
      }
    }

    return decks.map((d) => ({
      id: d.id,
      name: d.name,
      deckType: d.deckType,
      description: d.description,
      totalCards: d._count.flashcards,
      enrolledCount: enrolledByDeck[d.id] ?? 0,
      isOwned: d.ownerId === userId,
    }));
  }

  // ── GET /vocab/deck/:id ────────────────────────────────────────────────────
  async getDeckById(deckId: string, userId: string, page = 1, limit = 50) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, OR: [{ ownerId: null }, { ownerId: userId }] },
      include: { _count: { select: { flashcards: true } } },
    });
    if (!deck) throw new NotFoundException('Deck not found');

    const skip = (page - 1) * limit;
    const flashcards = await this.prisma.flashcard.findMany({
      where: { deckId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    const reviews = await this.prisma.flashcardReview.findMany({
      where: { userId, flashcardId: { in: flashcards.map((f) => f.id) } },
      select: { flashcardId: true, interval: true, nextReviewAt: true, lastRating: true, repetitions: true },
    });
    const reviewMap = new Map(reviews.map((r) => [r.flashcardId, r]));

    return {
      id: deck.id,
      name: deck.name,
      deckType: deck.deckType,
      description: deck.description,
      totalCards: deck._count.flashcards,
      page,
      limit,
      totalPages: Math.ceil(deck._count.flashcards / limit),
      flashcards: flashcards.map((f) => {
        const r = reviewMap.get(f.id);
        return {
          ...f,
          enrolled: !!r,
          nextReviewAt: r?.nextReviewAt ?? null,
          lastRating: r?.lastRating ?? null,
          repetitions: r?.repetitions ?? 0,
        };
      }),
    };
  }

  // ── GET /vocab/word/:word ──────────────────────────────────────────────────
  async getFlashcardByWord(word: string, userId: string) {
    const decoded = decodeURIComponent(word);
    const card = await this.prisma.flashcard.findFirst({
      where: { word: { equals: decoded, mode: 'insensitive' } },
      include: { deck: { select: { id: true, name: true, deckType: true } } },
    });
    if (!card) throw new NotFoundException(`Word "${decoded}" not found`);

    const review = await this.prisma.flashcardReview.findUnique({
      where: { userId_flashcardId: { userId, flashcardId: card.id } },
    });

    return {
      id: card.id,
      word: card.word,
      pronunciation: card.pronunciation,
      meaning: card.meaning,
      exampleSentence: card.exampleSentence,
      audioUrl: card.audioUrl,
      deck: card.deck,
      userReview: review
        ? { enrolled: true, interval: review.interval, nextReviewAt: review.nextReviewAt, lastRating: review.lastRating, repetitions: review.repetitions }
        : { enrolled: false },
    };
  }

  // ── GET /vocab/flashcard/:id ──────────────────────────────────────────────
  async getFlashcardById(id: string, userId: string) {
    const card = await this.prisma.flashcard.findUnique({
      where: { id },
      include: { deck: { select: { id: true, name: true, deckType: true } } },
    });
    if (!card) throw new NotFoundException('Flashcard not found');

    const review = await this.prisma.flashcardReview.findUnique({
      where: { userId_flashcardId: { userId, flashcardId: card.id } },
    });

    return {
      id: card.id,
      word: card.word,
      pronunciation: card.pronunciation,
      meaning: card.meaning,
      exampleSentence: card.exampleSentence,
      audioUrl: card.audioUrl,
      deck: card.deck,
      userReview: review
        ? { enrolled: true, interval: review.interval, nextReviewAt: review.nextReviewAt, lastRating: review.lastRating, repetitions: review.repetitions }
        : { enrolled: false },
    };
  }

  // ── POST /vocab/deck/:id/enroll ────────────────────────────────────────────
  async enrollInDeck(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, OR: [{ ownerId: null }, { ownerId: userId }] },
      include: { flashcards: { select: { id: true } } },
    });
    if (!deck) throw new NotFoundException('Deck not found');

    const existingReviews = await this.prisma.flashcardReview.findMany({
      where: { userId, flashcardId: { in: deck.flashcards.map((f) => f.id) } },
      select: { flashcardId: true },
    });
    const alreadyEnrolled = new Set(existingReviews.map((r) => r.flashcardId));

    const toEnroll = deck.flashcards
      .filter((f) => !alreadyEnrolled.has(f.id))
      .map((f) => ({ userId, flashcardId: f.id, nextReviewAt: new Date() }));

    if (toEnroll.length > 0) {
      await this.prisma.flashcardReview.createMany({ data: toEnroll });
    }

    return {
      deckId,
      enrolled: toEnroll.length,
      alreadyEnrolled: alreadyEnrolled.size,
      total: deck.flashcards.length,
    };
  }

  // ── GET /vocab/review-queue ────────────────────────────────────────────────
  async getReviewQueue(userId: string) {
    const now = new Date();
    const reviews = await this.prisma.flashcardReview.findMany({
      where: { userId, nextReviewAt: { lte: now } },
      include: {
        flashcard: { include: { deck: { select: { name: true, deckType: true } } } },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: 50,
    });

    return reviews.map((r) => ({
      ...r.flashcard,
      reviewId: r.id,
      nextReviewAt: r.nextReviewAt,
      repetitions: r.repetitions,
      lastRating: r.lastRating,
    }));
  }

  // ── POST /vocab/review ─────────────────────────────────────────────────────
  async submitReview(userId: string, flashcardId: string, rating: SrsRating) {
    const existing = await this.prisma.flashcardReview.findUnique({
      where: { userId_flashcardId: { userId, flashcardId } },
    });

    const current = existing ?? { interval: 1, easeFactor: 2.5, repetitions: 0 };
    const next = this.srs.calculateNextReview(current, rating);

    const review = await this.prisma.flashcardReview.upsert({
      where: { userId_flashcardId: { userId, flashcardId } },
      create: { userId, flashcardId, ...next, lastRating: rating, reviewedAt: new Date() },
      update: { ...next, lastRating: rating, reviewedAt: new Date() },
    });

    await this.prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalReviews: 1 },
      update: { totalReviews: { increment: 1 } },
    });

    const isGoodOrEasy = rating === 'good' || rating === 'easy';
    const xpEarned = isGoodOrEasy
      ? await this.xp.addXp(userId, XP_PER_GOOD_REVIEW, 'vocab_review')
      : 0;

    return {
      cardId: review.flashcardId,
      nextReviewAt: review.nextReviewAt,
      interval: review.interval,
      xpEarned,
    };
  }

  // ── POST /vocab/generate-custom-deck ──────────────────────────────────────
  async generateCustomDeck(userId: string, dto: GenerateCustomDeckDto) {
    const sourceText = dto.sourceText ?? (dto.words ? dto.words.join(', ') : '');
    const cards = await this.ai.generateFlashcardsFromText({ text: sourceText, targetLanguage: 'vi' });

    return this.prisma.deck.create({
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
  }

  // ── GET /vocab/deck (legacy) ───────────────────────────────────────────────
  async getDeck(dto: GetDeckDto) {
    const deckType = (dto.deckType?.toUpperCase() ?? undefined) as DeckType | undefined;
    const [total, flashcards] = await Promise.all([
      this.prisma.flashcard.count({ where: { deck: deckType ? { deckType } : undefined } }),
      this.prisma.flashcard.findMany({
        where: { deck: deckType ? { deckType } : undefined },
        skip: dto.skip,
        take: dto.limit,
        include: { deck: { select: { name: true, deckType: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return { data: flashcards, total, page: dto.page, limit: dto.limit, totalPages: Math.ceil(total / (dto.limit ?? 20)) };
  }

  async findFlashcard(id: string) {
    const card = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Flashcard not found');
    return card;
  }
}
