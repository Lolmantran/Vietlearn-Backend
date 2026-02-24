import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // All garbled cards have non-ASCII bytes in their IDs (mojibake from UTF-8→Latin-1 misread).
  // The clean originals have proper Unicode Vietnamese in their IDs and were created on 2026-02-23.
  // The corrupted duplicates were created on 2026-02-24 by the fix-encoding script.

  // Strategy: delete any flashcard whose ID contains a % or Ã or â€ or similar mojibake marker,
  // OR was created on or after 2026-02-24T09:57:00Z (when the bad seed ran).

  const cutoff = new Date('2026-02-24T09:57:00.000Z');

  // Find garbled cards
  const garbled = await prisma.flashcard.findMany({
    where: { createdAt: { gte: cutoff } },
    select: { id: true, word: true, createdAt: true },
  });

  console.log(`Found ${garbled.length} garbled/duplicate flashcards to delete:`);
  garbled.forEach((c) => console.log(`  - ${c.id} | word: ${c.word}`));

  if (garbled.length === 0) {
    console.log('Nothing to clean up.');
    return;
  }

  const ids = garbled.map((c) => c.id);

  // Delete FlashcardReviews linked to these cards first (FK constraint)
  const { count: reviewsDeleted } = await prisma.flashcardReview.deleteMany({
    where: { flashcardId: { in: ids } },
  });
  console.log(`\nDeleted ${reviewsDeleted} FlashcardReview records`);

  // Delete the garbled flashcards
  const { count: cardsDeleted } = await prisma.flashcard.deleteMany({
    where: { id: { in: ids } },
  });
  console.log(`Deleted ${cardsDeleted} garbled Flashcard records`);
  console.log('\n✅ Cleanup complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
