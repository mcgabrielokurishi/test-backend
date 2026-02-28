import { IsString } from "class-validator";

export class ValidateMeterDto {
  @IsString()
  disco: string;

  @IsString()
  meterNumber: string;
}
