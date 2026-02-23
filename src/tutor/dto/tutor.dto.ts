import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  topic?: string;
}

export class UserMessageEvent {
  @IsString()
  sessionId: string;

  @IsString()
  text: string;
}
