import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Decimal } from "decimal.js";

@Controller("wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // GET WALLET
  @Get()
  async getWallet(@Req() req) {
    return this.walletService.getWallet(req.user.userId);
  }

  // CREDIT WALLET
  @Post("credit")
  async credit(
    @Req() req,
    @Body("amount") amount: number
  ) {
    return this.walletService.credit(
      req.user.userId,
      new Decimal(amount)
    );
  }

  // DEBIT WALLET
  @Post("debit")
  async debit(
    @Req() req,
    @Body("amount") amount: number
  ) {
    return this.walletService.debit(
      req.user.userId,
      new Decimal(amount)
    );
  }
}