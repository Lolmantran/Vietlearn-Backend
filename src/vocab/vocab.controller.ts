import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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

  @Get('deck')
  getDeck(@Query() query: GetDeckDto) {
    return this.vocabService.getDeck(query);
  }

  @Get('review-queue')
  getReviewQueue(@CurrentUser() user: User) {
    return this.vocabService.getReviewQueue(user.id);
  }

  @Post('review')
  submitReview(@CurrentUser() user: User, @Body() dto: SubmitReviewDto) {
    return this.vocabService.submitReview(user.id, dto.flashcardId, dto.rating);
  }

  @Post('generate-custom-deck')
  generateCustomDeck(
    @CurrentUser() user: User,
    @Body() dto: GenerateCustomDeckDto,
  ) {
    return this.vocabService.generateCustomDeck(user.id, dto);
  }
}
