import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { detectIntent } from "./intent/hybrid-intent.service";
import { AIIntent } from "./intent/intent.types";
import { PrismaService } from "database/prisma.service";
import { ActionHandlers } from "./action/action.handlers";
import { ActionEngine } from "./action/action.engine";
import { buildUserContext } from "./context.builder";
import { UtilitiesService } from "src/utilies/utilities.service";
import { buildElectricityPrompt } from "./prompt.builder";
import { ChatMemoryService } from "./chat-memory.service";

@Injectable()
export class ElectricityAIService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  
  constructor( private prisma: PrismaService,
  private memoryService: ChatMemoryService,
  private utilitiesService: UtilitiesService,
    ) {}

  async ask(userId: string, question: string) {

 
const handlers = new ActionHandlers(
  this.prisma,
  this.utilitiesService
);
const intent = await detectIntent(question);
const engine = new ActionEngine(handlers);
const actionResult = await engine.execute(intent, userId);
if (actionResult.handled) {
  return actionResult.response;
}
    
  // Save user message
  await this.memoryService.saveMessage(userId, "user", question);

  const context = await buildUserContext(this.prisma, userId);

  const previousMessages = await this.memoryService.getRecentMessages(userId);

  const formattedHistory = previousMessages
    .reverse()
    .map(m => `${m.role}: ${m.message}`)
    .join("\n");

  const prompt = `
Conversation History:
${formattedHistory}

System Context:
${JSON.stringify(context)}

User Question:
${question}
`;

  const response = await this.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an intelligent electricity AI." },
      { role: "user", content: prompt }
    ]
  });

  const answer = response.choices[0].message.content ?? "";

  // Save assistant reply
  await this.memoryService.saveMessage(userId, "assistant", answer);

  return { answer };
}} 
