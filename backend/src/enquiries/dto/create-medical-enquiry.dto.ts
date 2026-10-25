import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CreateEnquiryDto } from './create-enquiry.dto.js';
import { normalizeOptionalText } from './normalize-optional-text.js';

export class CreateMedicalEnquiryDto extends CreateEnquiryDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 150)
  treatmentSpecialty!: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @Length(1, 200)
  preferredHospital?: string | null;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  preferredAppointmentDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(32767)
  travelCompanions?: number | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  additionalRequirements?: string | null;
}
