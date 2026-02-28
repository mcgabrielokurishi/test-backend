import { IsString, IsNumber, Min } from "class-validator";

export class PurchaseElectricityDto {
  @IsString()
  disco: string;

  @IsString()
  meterNumber: string;

  @IsNumber()
  @Min(100)
  amount: number;
}
