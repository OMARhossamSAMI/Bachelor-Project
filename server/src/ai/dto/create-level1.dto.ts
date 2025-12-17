// src/ai/dto/create-level1.dto.ts
export class CreateLevel1Dto {
  email: string;
  questions: {
    id: string;
    question: string;
    choices: string[];
    answer: number;
    hint?: string;
    explanation?: string;
    difficulty?: string;
  }[];
  modelUsed?: string;
  generatedAt?: Date;
}
