import { Module } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [SentencesService],
  controllers: [SentencesController],
})
export class SentencesModule {}
