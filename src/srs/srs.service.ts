import { Injectable } from '@nestjs/common';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: Date;
}

export interface FlashcardReviewLike {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * SM-2 spaced repetition algorithm.
 *
 * Rating → quality score mapping:
 *   again → 0  (complete blackout)
 *   hard  → 2  (recalled with serious difficulty)
 *   good  → 4  (recalled with some difficulty)
 *   easy  → 5  (perfect response)
 */
@Injectable()
export class SrsService {
  private readonly QUALITY: Record<SrsRating, number> = {
    again: 0,
    hard: 2,
    good: 4,
    easy: 5,
  };

  calculateNextReview(
    review: FlashcardReviewLike,
    rating: SrsRating,
  ): SrsResult {
    const q = this.QUALITY[rating];
    let { interval, easeFactor, repetitions } = review;

    if (q < 3) {
      // Failed – reset repetitions, restart intervals
      repetitions = 0;
      interval = 1;
    } else {
      // Passed
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor (clamp to [1.3, 3.0])
    easeFactor = Math.max(
      1.3,
      Math.min(3.0, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
    );

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    return { interval, easeFactor, repetitions, nextReviewAt };
  }
}
