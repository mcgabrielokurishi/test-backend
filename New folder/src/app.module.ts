import { Module } from "@nestjs/common";
import { PrismaModule } from "database/database.module";
import { WalletModule } from "./wallet/wallet.module";
import { AuthModule } from "./auth/auth.module";
import { ElectricityAIModule } from "./pay4light-AI/electricity-ai.module";
import { VendorModule } from "./vendor/vendor.module";
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WalletModule,
    // ElectricityAIModule,
    VendorModule
  ],
})
export class AppModule {}

