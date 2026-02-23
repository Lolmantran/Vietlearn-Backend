import { IsArray, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  // Accept either field name — frontend may send userAnswer or selectedOptionId
  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  userAnswer?: string;
}

export class SubmitQuizDto {
  @IsString()
  quizId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
