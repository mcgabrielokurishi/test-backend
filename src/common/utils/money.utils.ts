import { Decimal } from "decimal.js";

export const toDecimal = (amount: number | string) =>
  new Decimal(amount);

export const isPositive = (amount: Decimal) =>
  amount.gt(0);
