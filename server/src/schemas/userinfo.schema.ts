import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_info' })
export class UserInfo extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age?: number;

  @Prop()
  gender?: string;

  @Prop()
  nationality?: string;

  @Prop()
  germanLevel?: string; // e.g. 'A1', 'B2'

  // ✅ NEW: user's previous exposure to German culture or country
  @Prop()
  previousExperience?: string; // e.g. "Visited Germany once", "Studied German culture", etc.

  @Prop([String])
  interests?: string[];

  @Prop()
  goal?: string;

  @Prop()
  favoriteCuisine?: string;

  @Prop()
  regionPreference?: string;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);
