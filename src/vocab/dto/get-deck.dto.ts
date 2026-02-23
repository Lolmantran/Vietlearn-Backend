import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetDeckDto extends PaginationDto {
  @IsOptional()
  @IsIn(['core', 'travel', 'business', 'custom'])
  deckType?: 'core' | 'travel' | 'business' | 'custom';
}
