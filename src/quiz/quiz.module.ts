import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { AiModule } from '../ai/ai.module';
import { XpModule } from '../xp/xp.module';

@Module({
  imports: [AiModule, XpModule],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
