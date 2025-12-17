import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserGame } from '../schemas/usergame.schema';
import { CreateUserGameDto } from './dto/create-user-game.dto';
import { UpdateUserGameDto } from './dto/update-user-game.dto';

@Injectable()
export class UserGameService {
  constructor(
    @InjectModel(UserGame.name)
    private readonly userGameModel: Model<UserGame>,
  ) {}

  async createUserGame(dto: CreateUserGameDto): Promise<UserGame> {
    const exists = await this.userGameModel.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('User game already exists.');

    const newGame = new this.userGameModel({
      email: dto.email,
      // all scores and points start at default = 0
    });

    return newGame.save();
  }

  async updateUserGame(dto: UpdateUserGameDto): Promise<UserGame> {
    const userGame = await this.userGameModel.findOne({ email: dto.email });
    if (!userGame) throw new NotFoundException('User game not found.');

    Object.assign(userGame, dto);
    return userGame.save();
  }
  async getUserGameByEmail(email: string) {
    return this.userGameModel.findOne({ email }).exec();
  }
  // ✅ NEW: add wrong pretest question id (no duplicates)
  async addPretestWrongQuestion(email: string, questionId: number) {
    const updated = await this.userGameModel.findOneAndUpdate(
      { email },
      { $addToSet: { pretestWrongQuestionIds: questionId } },
      { new: true },
    );

    if (!updated) throw new NotFoundException('User game not found.');
    return updated;
  }

  // ✅ NEW: reset wrong list (useful when user retakes pretest)
  async resetPretestWrongQuestions(email: string) {
    const updated = await this.userGameModel.findOneAndUpdate(
      { email },
      { $set: { pretestWrongQuestionIds: [] } },
      { new: true },
    );

    if (!updated) throw new NotFoundException('User game not found.');
    return updated;
  }
}
