import { Module } from '@nestjs/common';
import { VocabService } from './vocab.service';
import { VocabController } from './vocab.controller';
import { AiModule } from '../ai/ai.module';
import { SrsModule } from '../srs/srs.module';

@Module({
  imports: [AiModule, SrsModule],
  providers: [VocabService],
  controllers: [VocabController],
  exports: [VocabService],
})
export class VocabModule {}
