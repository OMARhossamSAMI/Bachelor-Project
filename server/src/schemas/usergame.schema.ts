// usergame.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_game' })
export class UserGame extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: 0 })
  pretestScore: number;

  // ✅ NEW: post-test score
  @Prop({ default: 0 })
  posttestScore: number;

  @Prop({ default: 0 })
  level1Score: number;

  @Prop({ default: 0 })
  level2Score: number;

  @Prop({ default: 0 })
  level3Score: number;

  @Prop({ default: 0 })
  level4Score: number;

  @Prop({ default: 0 })
  level5Score: number;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  badges: number;

  @Prop({ default: 1 })
  userLevel: number;

  @Prop({ type: [Number], default: [] })
  pretestWrongQuestionIds: number[];
}

export const UserGameSchema = SchemaFactory.createForClass(UserGame);
