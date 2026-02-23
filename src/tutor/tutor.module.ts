import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { TutorGateway } from './tutor.gateway';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [AiModule, AuthModule, XpModule],
  providers: [TutorService, TutorGateway],
  controllers: [TutorController],
})
export class TutorModule {}
