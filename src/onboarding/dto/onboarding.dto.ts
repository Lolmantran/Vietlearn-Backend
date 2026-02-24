import {
  IsArray,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlacementAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  selectedAnswer: string;
}

export class SubmitPlacementTestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlacementAnswerDto)
  answers: PlacementAnswerDto[];
}

export class SetGoalsDto {
  // Accept both CEFR codes (A1, A2…) and frontend display labels
  @IsString()
  level: string;

  @IsArray()
  @IsString({ each: true })
  goals: string[];
}
