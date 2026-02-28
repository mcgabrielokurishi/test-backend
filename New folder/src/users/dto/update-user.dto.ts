import { IsOptional, IsString, IsEnum } from "class-validator";

export enum MeterType {
  PREPAID = "PREPAID",
  POSTPAID = "POSTPAID",
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  disco?: string;

  @IsOptional()
  @IsEnum(MeterType)
  meterType?: MeterType;

  @IsOptional()
  @IsString()
  meterNumber?: string;
}