import { SrsService, SrsRating } from './srs.service';

describe('SrsService', () => {
  let srs: SrsService;

  beforeEach(() => {
    srs = new SrsService();
  });

  const base = { interval: 1, easeFactor: 2.5, repetitions: 0 };

  it('resets on "again" rating', () => {
    const result = srs.calculateNextReview(
      { interval: 10, easeFactor: 2.5, repetitions: 5 },
      'again',
    );
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('gives interval=1 on first "good" review', () => {
    const result = srs.calculateNextReview(base, 'good');
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('gives interval=6 on second "good" review', () => {
    const result = srs.calculateNextReview(
      { interval: 1, easeFactor: 2.5, repetitions: 1 },
      'good',
    );
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('multiplies interval by easeFactor on subsequent reviews', () => {
    const result = srs.calculateNextReview(
      { interval: 6, easeFactor: 2.5, repetitions: 2 },
      'good',
    );
    expect(result.interval).toBe(15); // round(6 * 2.5)
    expect(result.repetitions).toBe(3);
  });

  it('increases easeFactor on "easy" rating', () => {
    const result = srs.calculateNextReview(base, 'easy');
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('decreases easeFactor on "hard" rating', () => {
    const result = srs.calculateNextReview(base, 'hard');
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('clamps easeFactor to minimum 1.3', () => {
    const result = srs.calculateNextReview(
      { interval: 1, easeFactor: 1.3, repetitions: 0 },
      'again',
    );
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('sets nextReviewAt in the future', () => {
    const result = srs.calculateNextReview(base, 'good');
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
  });

  it.each<[SrsRating, number]>([
    ['again', 0],
    ['hard', 2],
    ['good', 4],
    ['easy', 5],
  ])('rating %s maps to quality %i', (rating) => {
    // Just ensure it doesn't throw and returns a valid result
    const result = srs.calculateNextReview(base, rating);
    expect(result).toHaveProperty('interval');
    expect(result).toHaveProperty('easeFactor');
    expect(result).toHaveProperty('repetitions');
    expect(result).toHaveProperty('nextReviewAt');
  });
});
