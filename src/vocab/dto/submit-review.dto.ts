import { IsIn, IsString } from 'class-validator';

export class SubmitReviewDto {
  @IsString()
  flashcardId: string;

  @IsIn(['again', 'hard', 'good', 'easy'])
  rating: 'again' | 'hard' | 'good' | 'easy';
}
