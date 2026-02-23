import { IsIn, IsOptional, IsString } from 'class-validator';

export class GenerateContentDto {
  @IsIn(['text', 'topic'])
  inputType: 'text' | 'topic';

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  level?: string;
}
