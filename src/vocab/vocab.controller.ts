import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VocabService } from './vocab.service';
import { GetDeckDto } from './dto/get-deck.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { GenerateCustomDeckDto } from './dto/generate-custom-deck.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('vocab')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vocab')
export class VocabController {
  constructor(private readonly vocabService: VocabService) {}

  // ── Deck listing & browsing ───────────────────────────────────────────────

  @Get('decks')
  @ApiOperation({ summary: 'List all decks with user progress' })
  getDecks(@CurrentUser() user: User) {
    return this.vocabService.getDecks(user.id);
  }

  @Get('deck/:id')
  @ApiOperation({ summary: 'Get a single deck with its flashcards and user review state' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDeckById(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vocabService.getDeckById(
      id,
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('deck/:id/enroll')
  @ApiOperation({ summary: 'Add all cards from a deck to the review queue' })
  enrollInDeck(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vocabService.enrollInDeck(id, user.id);
  }

  // ── Word lookup (for word detail pages e.g. /vocab/ăn) ───────────────────

  @Get('word/:word')
  @ApiOperation({ summary: 'Look up a Vietnamese word — supports URL-encoded diacritics e.g. /word/%C4%83n' })
  getByWord(@CurrentUser() user: User, @Param('word') word: string) {
    return this.vocabService.getFlashcardByWord(word, user.id);
  }

  @Get('flashcard/:id')
  @ApiOperation({ summary: 'Get a single flashcard by ID with user review state' })
  getFlashcardById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.vocabService.getFlashcardById(id, user.id);
  }

  // ── SRS review queue ─────────────────────────────────────────────────────

  @Get('review-queue')
  @ApiOperation({ summary: 'Get cards due for review today' })
  getReviewQueue(@CurrentUser() user: User) {
    return this.vocabService.getReviewQueue(user.id);
  }

  @Post('review')
  @ApiOperation({ summary: 'Submit a review rating for a flashcard' })
  submitReview(@CurrentUser() user: User, @Body() dto: SubmitReviewDto) {
    return this.vocabService.submitReview(user.id, dto.flashcardId, dto.rating);
  }

  // ── Custom deck generation ────────────────────────────────────────────────

  @Post('generate-custom-deck')
  @ApiOperation({ summary: 'AI-generate a custom deck from text or a list of words' })
  generateCustomDeck(@CurrentUser() user: User, @Body() dto: GenerateCustomDeckDto) {
    return this.vocabService.generateCustomDeck(user.id, dto);
  }

  // ── Legacy paginated flashcard list ──────────────────────────────────────

  @Get('deck')
  @ApiOperation({ summary: '(Legacy) Paginated flashcard list filtered by deck type' })
  getDeck(@Query() query: GetDeckDto) {
    return this.vocabService.getDeck(query);
  }
}
