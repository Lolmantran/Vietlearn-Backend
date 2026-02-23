import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class GenerateCustomDeckDto {
  @IsString()
  @MinLength(1)
  deckName: string;

  @IsOptional()
  @IsString()
  sourceText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  words?: string[];
}
