import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { SrsModule } from './srs/srs.module';
import { VocabModule } from './vocab/vocab.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { SentencesModule } from './sentences/sentences.module';
import { TutorModule } from './tutor/tutor.module';
import { QuizModule } from './quiz/quiz.module';
import { ContentModule } from './content/content.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    SrsModule,
    VocabModule,
    OnboardingModule,
    SentencesModule,
    TutorModule,
    QuizModule,
    ContentModule,
    StatsModule,
  ],
})
export class AppModule {}


