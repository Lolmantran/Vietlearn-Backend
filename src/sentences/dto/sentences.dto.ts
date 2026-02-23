import { IsIn, IsOptional, IsString } from 'class-validator';

export class CheckSentenceDto {
  @IsIn(['vi'])
  targetLanguage: 'vi';

  @IsString()
  userSentence: string;

  @IsOptional()
  @IsString()
  referenceSentence?: string;
}

export class PatternDrillDto {
  @IsOptional()
  @IsString()
  patternId?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
