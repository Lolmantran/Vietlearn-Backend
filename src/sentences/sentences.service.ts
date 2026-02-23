import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { CheckSentenceDto, PatternDrillDto } from './dto/sentences.dto';
import { User } from '@prisma/client';

@Injectable()
export class SentencesService {
  constructor(private readonly ai: AiService) {}

  async checkSentence(dto: CheckSentenceDto, user: User) {
    return this.ai.checkSentence({
      userSentence: dto.userSentence,
      referenceSentence: dto.referenceSentence,
      level: user.level ?? 'A1',
    });
  }

  async patternDrill(dto: PatternDrillDto) {
    return this.ai.generatePatternDrills({
      topic: dto.topic,
      patternId: dto.patternId,
    });
  }
}
