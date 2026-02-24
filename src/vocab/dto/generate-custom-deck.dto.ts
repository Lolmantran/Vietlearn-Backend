import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class GenerateCustomDeckDto {
  @IsString()
  @MinLength(1)
  deckName: string;

  @IsOptional()
  @IsString()
  sourceText?: string;

  /** Alias for sourceText — accepted from the frontend as inputText */
  @IsOptional()
  @IsString()
  inputText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  words?: string[];
}
