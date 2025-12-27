import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReportResponseDto {
  @ApiProperty({ example: '12345-67890-abcde' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Q4 Nutrition Report' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'NUTRITION' })
  @Expose()
  type: string;

  @ApiProperty({ example: 'PDF' })
  @Expose()
  format: string;

  @ApiProperty({ 
    example: { 
      totalCalories: 1500, 
      avgProtein: 120,
      avgCarbs: 200,
      avgFats: 50
    }
  })
  @Expose()
  data: Record<string, any>;

  @ApiProperty({ example: '12345-client-id' })
  @Expose()
  clientId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ example: null })
  @Expose()
  deletedAt?: Date | null;
}
