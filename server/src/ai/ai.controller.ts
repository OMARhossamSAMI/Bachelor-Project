// src/ai/ai.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('level1/:email')
  async generateLevel1(@Param('email') email: string) {
    return this.aiService.createLevel1(email);
  }
  // ✅ Fetch existing Level 1 quiz by email
  @Get('level1/:email/get')
  async getLevel1(@Param('email') email: string) {
    return this.aiService.getLevel1ByEmail(email);
  }
  // src/ai/ai.controller.ts

  @Get('level2/:email')
  async generateLevel2(@Param('email') email: string) {
    return this.aiService.createLevel2(email);
  }

  @Get('level2/:email/get')
  async getLevel2(@Param('email') email: string) {
    return this.aiService.getLevel2ByEmail(email);
  }
  @Get('level3/:email')
  async generateLevel3(@Param('email') email: string) {
    return this.aiService.createLevel3(email);
  }

  @Get('level3/:email/get')
  async getLevel3(@Param('email') email: string) {
    return this.aiService.getLevel3ByEmail(email);
  }
}
