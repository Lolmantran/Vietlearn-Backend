import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('quiz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('daily')
  getDailyQuiz(@CurrentUser() user: User) {
    return this.quizService.getDailyQuiz(user.id);
  }

  @Post('submit')
  submitQuiz(@CurrentUser() user: User, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(user.id, dto);
  }
}
