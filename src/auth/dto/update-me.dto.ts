import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  level?: string;

  /** Why you are learning — list of goal keys or display labels */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  /** Daily study goal in minutes (e.g. 5, 10, 15, 20, 30) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(480)
  dailyGoal?: number;
}
