import { ApiProperty } from '@nestjs/swagger';

export class CreateDiaryDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;
}
