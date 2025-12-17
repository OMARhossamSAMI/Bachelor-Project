import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserGameService } from './usergame.service';
import { CreateUserGameDto } from './dto/create-user-game.dto';
import { UpdateUserGameDto } from './dto/update-user-game.dto';
import { AddPretestWrongDto } from './dto/add-pretest-wrong.dto';
import { ResetPretestWrongsDto } from './dto/reset-pretest-wrongs.dto';

@Controller('usergame')
export class UserGameController {
  constructor(private readonly userGameService: UserGameService) {}

  // Create initial game record
  @Post()
  async create(@Body() dto: CreateUserGameDto) {
    return this.userGameService.createUserGame(dto);
  }

  // Update any game field dynamically
  @Patch()
  async update(@Body() dto: UpdateUserGameDto) {
    return this.userGameService.updateUserGame(dto);
  }
  // ✅ NEW: add wrong question id during pretest
  @Patch('pretest/wrong')
  async addPretestWrong(@Body() dto: AddPretestWrongDto) {
    return this.userGameService.addPretestWrongQuestion(
      dto.email,
      dto.questionId,
    );
  }

  // ✅ NEW: reset wrong questions (for retake)
  @Patch('pretest/reset-wrongs')
  async resetPretestWrongs(@Body() dto: ResetPretestWrongsDto) {
    return this.userGameService.resetPretestWrongQuestions(dto.email);
  }
  // ✅ Get game data by email
  @Get(':email')
  async getByEmail(@Param('email') email: string) {
    const userGame = await this.userGameService.getUserGameByEmail(email);
    if (!userGame) throw new NotFoundException('User game not found');
    return userGame;
  }
}
