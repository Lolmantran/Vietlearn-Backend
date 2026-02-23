import {
  IsArray,
  IsIn,
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
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level: string;

  @IsArray()
  @IsString({ each: true })
  goals: string[];
}
