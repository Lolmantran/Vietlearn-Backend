import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { GenerateContentDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async generateLesson(dto: GenerateContentDto) {
    if (dto.inputType === 'text' && !dto.text) {
      throw new BadRequestException('text is required when inputType is "text"');
    }
    if (dto.inputType === 'topic' && !dto.topic) {
      throw new BadRequestException('topic is required when inputType is "topic"');
    }

    const lesson = await this.ai.generateLessonFromContent({
      inputType: dto.inputType,
      text: dto.text,
      topic: dto.topic,
      level: dto.level,
    });

    // Persist generated lesson
    const saved = await this.prisma.contentLesson.create({
      data: {
        inputType: dto.inputType,
        source: dto.text ?? dto.topic,
        vocab: lesson.vocab as object[],
        examples: lesson.examples as unknown as object[],
        exercises: lesson.exercises as object[],
      },
    });

    return { id: saved.id, ...lesson };
  }
}
