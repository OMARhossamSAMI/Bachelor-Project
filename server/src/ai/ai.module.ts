import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { UserModule } from '../user/user.module';
import { UserInfoModule } from '../userinfo/userinfo.module';
import { UserGameModule } from '../usergame/usergame.module';
import { Level1, Level1Schema } from '../schemas/level1.schema';
import { Level2, Level2Schema } from '../schemas/level2.schema';
import { Level3, Level3Schema } from '../schemas/level3.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Level1.name, schema: Level1Schema },
      { name: Level2.name, schema: Level2Schema },
      { name: Level3.name, schema: Level3Schema }, // ← ADD THIS
    ]),
    UserModule,
    UserInfoModule,
    UserGameModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
