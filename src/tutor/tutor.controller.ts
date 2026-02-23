import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TutorService } from './tutor.service';
import { CreateSessionDto } from './dto/tutor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('tutor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('session')
  createSession(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.tutorService.createOrFetchSession(user.id, dto.topic);
  }

  @Get('session/:id/history')
  getHistory(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.tutorService.getSessionHistory(
      id,
      user.id,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
