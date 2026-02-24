import { Module } from '@nestjs/common';
import { VocabService } from './vocab.service';
import { VocabController } from './vocab.controller';
import { AiModule } from '../ai/ai.module';
import { SrsModule } from '../srs/srs.module';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [AiModule, SrsModule, XpModule],
  providers: [VocabService],
  controllers: [VocabController],
  exports: [VocabService],
})
export class VocabModule {}
