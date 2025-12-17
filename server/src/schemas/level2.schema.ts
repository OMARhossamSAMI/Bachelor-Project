import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Level2 {
  @Prop({ required: true })
  email: string;

  @Prop()
  region: string;

  @Prop()
  theme: string;

  @Prop()
  difficulty: string;

  @Prop({
    type: [
      {
        emoji: String,
        label: String,
        isCorrect: Boolean,
        origin: String,
        info: String, // ✅ NEW
      },
    ],
    required: true,
  })
  cards: {
    emoji: string;
    label: string;
    isCorrect: boolean;
    origin: string;
    info?: string; // ✅ NEW
  }[];

  @Prop()
  modelUsed: string;

  @Prop()
  generatedAt: Date;
}

export const Level2Schema = SchemaFactory.createForClass(Level2);
