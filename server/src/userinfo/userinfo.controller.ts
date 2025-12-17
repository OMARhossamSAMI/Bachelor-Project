import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UserInfoService } from './userinfo.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';

@Controller('userinfo')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Post()
  async create(@Body() dto: CreateUserInfoDto) {
    return this.userInfoService.createUserInfo(dto);
  }

  @Get(':email')
  async getByEmail(@Param('email') email: string) {
    return this.userInfoService.getUserInfoByEmail(email);
  }
}
