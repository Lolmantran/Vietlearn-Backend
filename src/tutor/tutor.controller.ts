import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TutorService } from './tutor.service';
import { CreateSessionDto, SendMessageDto } from './dto/tutor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('tutor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List all tutor sessions for current user' })
  getSessions(@CurrentUser() user: User) {
    return this.tutorService.getSessions(user.id);
  }

  @Post('session')
  @ApiOperation({ summary: 'Create or reuse a tutor session' })
  createSession(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.tutorService.createOrFetchSession(user.id, dto.topic, dto.mode, dto.level);
  }

  @Post('session/:id/message')
  @ApiOperation({ summary: 'Send a message and get AI reply (REST alternative to WebSocket)' })
  sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.tutorService.handleUserMessage(id, user.id, dto.text);
  }

  @Get('session/:id/history')
  @ApiOperation({ summary: 'Get message history for a session' })
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
