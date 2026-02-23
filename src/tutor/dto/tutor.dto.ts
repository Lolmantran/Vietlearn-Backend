import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  mode?: string; // 'explain' | 'correct' | 'free' — normalized in service

  @IsOptional()
  @IsString()
  level?: string;
}

export class SendMessageDto {
  @IsString()
  text: string;
}

export class UserMessageEvent {
  @IsString()
  sessionId: string;

  @IsString()
  text: string;
}
