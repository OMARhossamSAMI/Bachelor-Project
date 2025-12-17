import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGame, UserGameSchema } from '../schemas/usergame.schema';
import { UserGameService } from './usergame.service';
import { UserGameController } from './usergame.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserGame.name, schema: UserGameSchema },
    ]),
  ],
  providers: [UserGameService],
  controllers: [UserGameController],
  exports: [UserGameService],
})
export class UserGameModule {}
