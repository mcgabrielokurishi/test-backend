import { IsString, IsNumber } from "class-validator";

export class VendElectricityDto {
  @IsString()
  meterId: string;

  @IsNumber()
  amount: number;
}