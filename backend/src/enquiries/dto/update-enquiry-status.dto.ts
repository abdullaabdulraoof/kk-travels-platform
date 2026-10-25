import { IsEnum } from 'class-validator';
import { EnquiryStatus } from '../../database/entities/enquiry.entity.js';

export class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status!: EnquiryStatus;
}
