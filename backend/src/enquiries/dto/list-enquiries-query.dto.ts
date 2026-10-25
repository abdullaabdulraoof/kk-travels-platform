import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EnquiryStatus,
  EnquiryType,
} from '../../database/entities/enquiry.entity.js';

export const ENQUIRY_SORT_FIELDS = [
  'createdAt',
  'customerName',
  'enquiryNumber',
] as const;

export type EnquirySortField = (typeof ENQUIRY_SORT_FIELDS)[number];

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class ListEnquiriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsEnum(EnquiryType)
  type?: EnquiryType;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  search?: string;

  @IsOptional()
  @IsIn(ENQUIRY_SORT_FIELDS)
  sortBy?: EnquirySortField;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}
