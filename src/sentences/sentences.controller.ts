import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SentencesService } from './sentences.service';
import { CheckSentenceDto, PatternDrillDto } from './dto/sentences.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('sentences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sentences')
export class SentencesController {
  constructor(private readonly sentencesService: SentencesService) {}

  @Post('check')
  checkSentence(@Body() dto: CheckSentenceDto, @CurrentUser() user: User) {
    return this.sentencesService.checkSentence(dto, user);
  }

  @Post('pattern-drill')
  patternDrill(@Body() dto: PatternDrillDto) {
    return this.sentencesService.patternDrill(dto);
  }
}
