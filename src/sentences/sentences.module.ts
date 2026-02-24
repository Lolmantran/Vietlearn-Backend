import { Module } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';
import { AiModule } from '../ai/ai.module';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [AiModule, XpModule],
  providers: [SentencesService],
  controllers: [SentencesController],
})
export class SentencesModule {}
