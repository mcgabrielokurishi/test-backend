import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { PrismaService } from "database/prisma.service";

@Module({
  providers: [OtpService, PrismaService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}