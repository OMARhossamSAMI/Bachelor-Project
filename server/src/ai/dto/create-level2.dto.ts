export class CreateLevel2Dto {
  email: string;

  region: string;
  theme: string;
  difficulty?: string;

  cards: {
    emoji: string;
    label: string;
    isCorrect: boolean;
    origin: string;
    info?: string; // ✅ NEW
  }[];

  modelUsed?: string;
  generatedAt?: Date;
}
