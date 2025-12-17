import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { UserInfoModule } from './userinfo/userinfo.module';
import { UserGameModule } from './usergame/usergame.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Replace with your own connection string
    MongooseModule.forRoot(
      'mongodb://Omar_Hossam:OMARhoss2003!@ac-bso2n8p-shard-00-00.rmk3rin.mongodb.net:27017,ac-bso2n8p-shard-00-01.rmk3rin.mongodb.net:27017,ac-bso2n8p-shard-00-02.rmk3rin.mongodb.net:27017/?replicaSet=atlas-n0xxkd-shard-0&ssl=true&authSource=admin',
    ),
    UserModule,
    UserInfoModule,
    UserGameModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
