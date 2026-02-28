import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt.guard";
import { ElectricityAIService } from "./electricity-ai.service";

@Controller("pay4light-ai")
@UseGuards(JwtAuthGuard)
export class ElectricityAIController {
  constructor(private aiService: ElectricityAIService) {}

  @Post("ask")
  ask(@Body("question") question: string, @Body("userId") userId: string) {
    return this.aiService.ask(userId, question);
  }
}
