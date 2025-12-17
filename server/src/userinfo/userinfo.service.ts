import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo } from '../schemas/userinfo.schema';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UserGameService } from '../usergame/usergame.service';
import { CreateUserGameDto } from '../usergame/dto/create-user-game.dto';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectModel(UserInfo.name)
    private readonly userInfoModel: Model<UserInfo>,
    private readonly userGameService: UserGameService,
  ) {}

  async createUserInfo(dto: CreateUserInfoDto): Promise<UserInfo> {
    const existing = await this.userInfoModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('User info already exists.');

    const createdInfo = new this.userInfoModel(dto);
    const savedInfo = await createdInfo.save();

    try {
      const gameDto: CreateUserGameDto = { email: dto.email };
      await this.userGameService.createUserGame(gameDto);
    } catch (err) {
      console.error('Error creating UserGame:', err.message);
    }

    return savedInfo;
  }

  async getUserInfoByEmail(email: string): Promise<UserInfo> {
    const userInfo = await this.userInfoModel.findOne({ email });
    if (!userInfo) throw new NotFoundException('User info not found.');
    return userInfo;
  }
}
