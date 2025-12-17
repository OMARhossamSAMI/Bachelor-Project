// src/userinfo/userinfo.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UserInfoSchema } from '../schemas/userinfo.schema';
import { UserInfoService } from './userinfo.service';
import { UserInfoController } from './userinfo.controller';
import { UserGameModule } from '../usergame/usergame.module'; // ✅ import module

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInfo.name, schema: UserInfoSchema },
    ]),
    UserGameModule, // ✅ add this
  ],
  providers: [UserInfoService],
  controllers: [UserInfoController],
  exports: [UserInfoService],
})
export class UserInfoModule {}
