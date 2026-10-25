import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateEnquiryDto } from './create-enquiry.dto.js';
import { normalizeOptionalText } from './normalize-optional-text.js';

@ValidatorConstraint({
  name: 'travelEndDateOnOrAfterStartDate',
  async: false,
})
class TravelEndDateOnOrAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(
    travelEndDate: unknown,
    args: ValidationArguments,
  ): boolean {
    const travelStartDate = (args.object as CreateTourismEnquiryDto)
      .travelStartDate;

    if (
      typeof travelStartDate !== 'string' ||
      typeof travelEndDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(travelStartDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(travelEndDate)
    ) {
      return true;
    }

    return travelEndDate >= travelStartDate;
  }

  defaultMessage(): string {
    return 'travelEndDate must be on or after travelStartDate';
  }
}

export class CreateTourismEnquiryDto extends CreateEnquiryDto {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @Length(1, 200)
  preferredDestination = 'Kerala';

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  travelStartDate?: string | null;

  @IsOptional()
  @Validate(TravelEndDateOnOrAfterStartDateConstraint)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  travelEndDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(32767)
  numberOfTravelers?: number | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  travelInterests?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  accommodationRequired = false;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  additionalRequirements?: string | null;
}
