import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { XpService } from '../xp/xp.service';
import { CheckSentenceDto, PatternDrillDto } from './dto/sentences.dto';
import { User } from '@prisma/client';

const XP_CORRECT_SENTENCE = 8;

@Injectable()
export class SentencesService {
  constructor(
    private readonly ai: AiService,
    private readonly xp: XpService,
  ) {}

  async checkSentence(dto: CheckSentenceDto, user: User) {
    const result = await this.ai.checkSentence({
      userSentence: dto.userSentence,
      referenceSentence: dto.referenceSentence,
      level: user.level ?? 'A1',
    });

    let xpEarned = 0;
    if (result.isCorrect) {
      xpEarned = await this.xp.addXp(user.id, XP_CORRECT_SENTENCE, 'sentence_correct');
    }
    await this.xp.addStudyTime(user.id, 1); // ~1 min per sentence check

    return { ...result, xpEarned };
  }

  async patternDrill(dto: PatternDrillDto) {
    return this.ai.generatePatternDrills({
      topic: dto.topic,
      patternId: dto.patternId,
    });
  }
}
