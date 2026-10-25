import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreateEnquiryNoteDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  content!: string;
}
