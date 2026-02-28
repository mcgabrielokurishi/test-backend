import { Module } from "@nestjs/common";
import { ElectricityAIService } from "./electricity-ai.service";
import { PrismaModule } from "database/database.module";
import { ElectricityAIController } from "./electricity-ai.controller";
import { ChatMemoryModule } from "src/chat-memory/chat-memory.module";
import { UtilitiesService } from "src/utilies/utilities.service";
import { ChatMemoryService } from "./chat-memory.service";

@Module({
  imports:[
    ChatMemoryModule,
    PrismaModule
  ],
  providers: [ElectricityAIService,UtilitiesService,ChatMemoryService],
  controllers: [ElectricityAIController],
})
export class ElectricityAIModule {}
