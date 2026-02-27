import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message:
      "Password must contain at least one uppercase letter, one number, and one symbol",
  })
  password: string;
}
