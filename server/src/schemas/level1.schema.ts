// src/schemas/level1.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Level1 extends Document {
  @Prop({ required: true })
  email: string; // user email (owner of this level)

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        choices: { type: [String], required: true },
        answer: { type: Number, required: true },
        hint: { type: String },
        explanation: { type: String },
        difficulty: { type: String },
      },
    ],
    required: true,
  })
  questions: {
    id: string;
    question: string;
    choices: string[];
    answer: number;
    hint?: string;
    explanation?: string;
    difficulty?: string;
  }[];

  @Prop({ default: 'gemini-2.0-flash' })
  modelUsed: string;

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const Level1Schema = SchemaFactory.createForClass(Level1);
