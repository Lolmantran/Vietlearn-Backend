import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { GenerateContentDto } from './dto/content.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('generate')
  generate(@Body() dto: GenerateContentDto) {
    return this.contentService.generateLesson(dto);
  }
}
