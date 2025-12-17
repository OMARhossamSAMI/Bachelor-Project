import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Level3 extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  theme: string;

  @Prop({ required: true })
  dishes: Array<{
    name: string;
    cards: Array<{
      emoji: string;
      label: string;
      isCorrect: boolean;
      origin: string;
    }>;
  }>;

  @Prop()
  difficulty: string;

  @Prop()
  modelUsed: string;

  @Prop()
  generatedAt: Date;
}

export const Level3Schema = SchemaFactory.createForClass(Level3);
