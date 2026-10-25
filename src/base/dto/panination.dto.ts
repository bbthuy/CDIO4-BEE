import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOption {
  NEWEST = 'Newest',
  OLDEST = 'Oldest',
  HIGHESTPOINT = 'HighestPoint',
  LOWESTPOINT = 'LowestPoint'
}
export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Sort by', example: SortOption.NEWEST, enum: SortOption })
  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @ApiProperty({ description: 'Search query', example: 'search query' })
  @IsOptional()
  q?: string;
}
