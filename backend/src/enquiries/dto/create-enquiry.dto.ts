import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { PreferredLanguage } from '../../database/entities/enquiry.entity.js';
import { normalizeOptionalText } from './normalize-optional-text.js';

export class CreateEnquiryDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 150)
  customerName!: string;

  @IsOptional()
  @Transform(({ value }) => {
    const normalized = normalizeOptionalText(value);
    return typeof normalized === 'string' ? normalized.toLowerCase() : normalized;
  })
  @IsEmail()
  @Length(1, 255)
  email?: string | null;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 30)
  phone!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 100)
  country!: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(PreferredLanguage)
  preferredLanguage: PreferredLanguage = PreferredLanguage.ENGLISH;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  message?: string | null;
}
