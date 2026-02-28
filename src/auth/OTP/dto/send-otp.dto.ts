import { IsOptional, IsPhoneNumber, IsEmail, IsEnum } from "class-validator";
import { OtpPurpose } from "@prisma/client";

export class SendOtpDto {
  @IsOptional()
  @IsPhoneNumber("NG")
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}