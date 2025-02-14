/* eslint-disable @typescript-eslint/naming-convention */
import { Path } from 'nestjs-i18n';

export type ValidationTranslations = {
  custom: {
    dates: {
      start_date_cant_be_future: string;
      start_end_cant_be_same_day: string;
      end_date_cant_be_future: string;
      end_date_greater_than_start_date: string;
      start_date_cant_be_past: string;
    };
  };
  validation: {
    array_not_empty: string;
    array_is_in: string;
    is_date_time_string: string;
    is_time_string: string;
    is_exact_length: string;
    is_in: string;
    is_positive: string;
    is_unique: string;
    invalid_email: string;
    is_valid_email_or_phone_number: string;
    is_simple_string: string;
    invalid_password: string;
    invalid_phone_number: string;
    invalid_uuid: string;
    max_length: string;
    min_length: string;
    must_be_boolean: string;
    must_be_enum: string;
    must_be_jwt: string;
    must_be_number: string;
    must_be_number_string: string;
    must_be_hexadecimal_color: string;
    must_be_string: string;
    must_be_url: string;
    not_empty: string;
  };
};

export const replacements: Record<string, Path<ValidationTranslations>> = {
  arrayNotEmpty: 'validation.array_not_empty',
  arrayIsIn: 'validation.array_is_in',
  isBoolean: 'validation.must_be_boolean',
  isDateTimeString: 'validation.is_date_time_string',
  isTimeString: 'validation.is_time_string',
  isExactLength: 'validation.is_exact_length',
  isEmail: 'validation.invalid_email',
  isEnum: 'validation.must_be_enum',
  isIn: 'validation.is_in',
  isJwt: 'validation.must_be_jwt',
  isNotEmpty: 'validation.not_empty',
  isNumber: 'validation.must_be_number',
  isHexColor: 'validation.must_be_hexadecimal_color',
  isNumberString: 'validation.must_be_number_string',
  isPositive: 'validation.is_positive',
  isUnique: 'validation.is_unique',
  isString: 'validation.must_be_string',
  isUrl: 'validation.must_be_url',
  isUuid: 'validation.invalid_uuid',
  isValidEmailOrPhoneNumber: 'validation.is_valid_email_or_phone_number',
  isValidPassword: 'validation.invalid_password',
  isValidPhoneNumber: 'validation.invalid_phone_number',
  isSimpleString: 'validation.is_simple_string',
  maxLength: 'validation.max_length',
  minLength: 'validation.min_length',
};
