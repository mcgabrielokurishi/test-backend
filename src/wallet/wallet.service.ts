import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "database/prisma.service";
import { Decimal } from "decimal.js";
import { TransactionType } from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {console.log("WalletService initialized");}

  // CREATE WALLET
  async createWalletForUser(userId: string) {
    return this.prisma.wallet.create({
      data: { userId },
    });
  }

  // GET WALLET
  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException("Wallet not found");8
    }

    return wallet;
  }
  

  // CREDIT WALLET (Atomic Increment)
  async credit(
    userId: string,
    amount: Decimal,
    description = "Wallet credit"
  ) {
    if (amount.lte(0)) {
      throw new BadRequestException("Invalid amount");
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new BadRequestException("Wallet not found");
      if (wallet.locked) throw new ForbiddenException("Wallet is locked");

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TransactionType.FUND,
          amount,
          status: "SUCCESS",
          reference: randomUUID(),
          description,
        },
      });

      return { wallet: updatedWallet, transaction };
    });
  }

  // DEBIT WALLET (Atomic + Safe)
  async debit(
    userId: string,
    amount: Decimal,
    description = "Wallet debit"
  ) {
    if (amount.lte(0)) {
      throw new BadRequestException("Invalid amount");
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new BadRequestException("Wallet not found");
      if (wallet.locked) throw new ForbiddenException("Wallet is locked");

      if (wallet.balance.lt(amount)) {
        throw new BadRequestException("Insufficient balance");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TransactionType.WITHDRAW,
          amount,
          status: "SUCCESS",
          reference: randomUUID(),
          description,
        },
      });

      return { wallet: updatedWallet, transaction };
    });
  }

  // DEBIT WITH IDEMPOTENCY (Production Safe)
  async debitWithIdempotency(
    userId: string,
    amount: Decimal,
    reference: string,
    description = "Wallet debit"
  ) {
    if (amount.lte(0)) {
      throw new BadRequestException("Invalid amount");
    }

    return this.prisma.$transaction(async (tx) => {
      // Check duplicate reference
      const existing = await tx.transaction.findUnique({
        where: { reference },
      });

      if (existing) {
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        return {
          wallet,
          transaction: existing,
          duplicated: true,
        };
      }

      //  Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new BadRequestException("Wallet not found");
      if (wallet.locked) throw new ForbiddenException("Wallet is locked");

      if (wallet.balance.lt(amount)) {
        throw new BadRequestException("Insufficient balance");
      }

      // Atomic decrement
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      //  Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TransactionType.WITHDRAW,
          amount,
          reference,
          status: "SUCCESS",
          description,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
        duplicated: false,
      };
    });
  }

  
}
