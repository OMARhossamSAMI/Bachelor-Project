// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { UserInfoService } from '../userinfo/userinfo.service';
import { UserGameService } from '../usergame/usergame.service';
import { GoogleGenAI } from '@google/genai';
import { Level1 } from '../schemas/level1.schema';
import { Level2 } from '../schemas/level2.schema';
import { Level3 } from '../schemas/level3.schema';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AiService {
  private client: GoogleGenAI;

  constructor(
    private readonly userService: UserService,
    private readonly userInfoService: UserInfoService,
    private readonly userGameService: UserGameService,
    @InjectModel(Level1.name) private level1Model: Model<Level1>,
    @InjectModel(Level2.name) private level2Model: Model<Level1>,
    @InjectModel(Level3.name) private level3Model: Model<Level3>,
  ) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  private formatRegion(regionPreference?: string[] | string): string {
    if (!regionPreference) return 'Germany';

    if (Array.isArray(regionPreference)) {
      if (regionPreference.length === 0) return 'Germany';
      if (regionPreference.length === 1) return regionPreference[0];

      // Multiple regions → readable for AI
      return regionPreference.slice(0, 2).join(' & ');
    }

    return regionPreference;
  }

  async createLevel1(email: string) {
    const user = await this.userService.findByEmail(email);
    const userInfo = await this.userInfoService.getUserInfoByEmail(email);
    const userGame = await this.userGameService.getUserGameByEmail(email);
    const regionText = this.formatRegion(userInfo.regionPreference);

    if (!user || !userInfo || !userGame)
      throw new Error('Missing user data for Level 1 creation');

    // 🧩 Check if level1 already exists for this user
    const existing = await this.level1Model.findOne({ email });
    if (existing) return existing; // ✅ Return saved data if already generated

    // === 🧩 PRE-TEST QUESTIONS (for adaptation)
    type Difficulty = 'easy' | 'medium' | 'hard';

    type QuestionDomain =
      | 'iconic_dishes'
      | 'ingredients'
      | 'street_food'
      | 'regional_diversity'
      | 'eating_habits'
      | 'festival_culture'
      | 'specialty_product';

    // === Question list with difficulty, explanation & sources ===
    const questions = [
      {
        id: 1,
        type: 'image',
        question: 'What is this dish typically served with?',
        image: '/assets/img/Pre-test/bratwurst.jpg',
        options: [
          'Bread roll & mustard',
          'Potato salad',
          'Sauerkraut & potatoes',
          'Bread with ketchup',
        ],
        answer: 'Bread roll & mustard',
        difficulty: 'easy' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Tests whether the learner knows the typical serving style of German bratwurst as a street snack (Brötchen + mustard).',
        sources: [
          'https://en.wikipedia.org/wiki/Bratwurst',
          'https://festwirt.de/en/bratwursts-and-its-different-varieties/',
        ],
      },

      {
        id: 2,
        type: 'text',
        question: 'What is the main ingredient in Sauerkraut?',
        options: ['White cabbage', 'Red cabbage', 'Cucumber', 'Turnip'],
        answer: 'White cabbage',
        difficulty: 'medium' as Difficulty,
        domain: 'ingredients' as QuestionDomain,
        explanation:
          'Checks basic knowledge that Sauerkraut is fermented cabbage, a core stereotype of German cuisine.',
        sources: [
          'https://en.wikipedia.org/wiki/Sauerkraut',
          'https://elavegan.com/how-to-make-sauerkraut/',
        ],
      },

      {
        id: 3,
        type: 'image',
        question: 'What is the name of this baked item?',
        image: '/assets/img/Pre-test/pretzel.jpg',
        options: ['Brezel', 'Laugenstange', 'Kaisersemmel', 'Schrippe'],
        answer: 'Brezel',

        difficulty: 'easy' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Measures recognition of the Brezel/pretzel as an iconic German baked good, especially in Bavaria and at Oktoberfest.',
        sources: [
          'https://en.wikipedia.org/wiki/Pretzel',
          'https://germanfoods.org/german-food-facts/all-hail-the-humble-pretzel-an-oktoberfest-classic/',
        ],
      },

      {
        id: 4,
        type: 'imageGrid',
        question: 'Which is Germany’s most popular street food today?',
        imageOptions: [
          { src: '/assets/img/Pre-test/doner.jpg', label: 'Döner Kebab' },
          { src: '/assets/img/Pre-test/Currywurst.jpg', label: 'Currywurst' },
          {
            src: '/assets/img/Pre-test/bratwurst.jpg',
            label: 'Bratwurst with roll',
          },
          {
            src: '/assets/img/Pre-test/Leberkäse sandwich.jpg',
            label: 'Leberkäse sandwich',
          },
        ],
        answer: 'Döner Kebab',

        difficulty: 'medium' as Difficulty,
        domain: 'street_food' as QuestionDomain,
        explanation:
          'Assesses awareness of modern German street food culture and migration influence, where Döner has overtaken Currywurst in popularity.',
        sources: [
          'https://adventure.com/gemany-fast-food-turkish-doner-kebab/',
          'https://www.aa.com.tr/en/culture/doner-kebab-is-more-popular-than-currywurst-in-germany-survey-finds/2774790',
        ],
      },

      {
        id: 5,
        type: 'text',
        question: 'How is Sauerbraten traditionally prepared?',
        options: [
          'Marinated & roasted',
          'Smoked & grilled',
          'Pan-fried',
          'Steamed',
        ],
        answer: 'Marinated & roasted',
        difficulty: 'medium' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Tests deeper knowledge that Sauerbraten is a marinated pot roast, usually beef, slowly roasted after several days in a vinegar/wine marinade.',
        sources: [
          'https://en.wikipedia.org/wiki/Sauerbraten',
          'https://daysofjay.com/2022/11/18/real-german-sauerbraten/',
        ],
      },

      {
        id: 6,
        type: 'matching',
        question:
          'Match the correct potato salad style to its region (South vs North).',
        pairs: [
          {
            id: 'south',
            label: 'Southern Germany',
            image: '/assets/img/Pre-test/kartoffelsalat_south.png',
          },
          {
            id: 'north',
            label: 'Northern Germany',
            image: '/assets/img/Pre-test/kartoffelsalat_north.png',
          },
        ],
        difficulty: 'hard' as Difficulty,
        domain: 'regional_diversity' as QuestionDomain,
        explanation:
          'Captures knowledge of regional differences in everyday foods: northern Kartoffelsalat is mayo-based, southern versions use broth or vinegar-oil.',
        sources: [
          'https://www.tastingtable.com/926829/what-makes-german-potato-salad-different-from-american/',
          'https://www.reddit.com/r/germany/comments/7v1chy/is_german_potato_salad_a_traditional_dish/',
        ],
      },

      {
        id: 7,
        type: 'text',
        question: 'Traditionally, when do Germans eat their main warm meal?',
        options: ['Early morning', 'Midday', 'Late evening', 'After midnight'],
        answer: 'Midday',
        difficulty: 'medium' as Difficulty,
        domain: 'eating_habits' as QuestionDomain,
        explanation:
          'Measures understanding of traditional eating habits where the main hot meal (Mittagessen) is eaten around noon.',
        sources: [
          'https://en.wikipedia.org/wiki/German_cuisine',
          'https://germanfoods.org/german-food-facts/breakfast-lunch-dinner-snacks/',
        ],
      },

      {
        id: 8,
        type: 'matching',
        question: 'Match each dish to its region in Germany.',
        pairs: [
          {
            id: 'bavaria',
            label: 'Weißwurst (Bavaria)',
            image: '/assets/img/Pre-test/Weisswurst.png',
          },
          {
            id: 'north',
            label: 'Labskaus (Northern Germany)',
            image: '/assets/img/Pre-test/LabsKaus.png',
          },
          {
            id: 'swabia',
            label: 'Spätzle (Swabia)',
            image: '/assets/img/Pre-test/Spätzle.png',
          },
        ],

        difficulty: 'hard' as Difficulty,
        domain: 'regional_diversity' as QuestionDomain,
        explanation:
          'Assesses regional food culture knowledge by linking Weißwurst to Bavaria, Labskaus to Northern Germany, and Spätzle to Swabia.',
        sources: [
          'https://www.discover-bavaria.com/Inspiration/bavarian-specialities',
          'https://en.wikipedia.org/wiki/Labskaus',
          'https://en.wikipedia.org/wiki/Sp%C3%A4tzle',
        ],
      },
      {
        id: 9,
        type: 'imageGrid',
        question: 'Which of the following cheeses is Milbenkäse?',
        imageOptions: [
          { src: '/assets/img/Pre-test/Milbenkäse.jpg', label: 'Milbenkäse' },
          { src: '/assets/img/Pre-test/brie.jpg', label: 'Brie' },
          { src: '/assets/img/Pre-test/emmental.jpg', label: 'Emmental' },
          { src: '/assets/img/Pre-test/Gouda.jpg', label: 'Gouda' },
        ],
        answer: 'Milbenkäse',
        difficulty: 'hard' as Difficulty,
        domain: 'specialty_product' as QuestionDomain,
        explanation:
          'Tests advanced knowledge of a rare German specialty cheese from Würchwitz that is ripened with cheese mites.',
        sources: [
          'https://en.wikipedia.org/wiki/Milbenk%C3%A4se',
          'https://www.atlasobscura.com/places/cheese-mite-memorial',
        ],
      },
      {
        id: 10,
        type: 'image',
        question: 'What is the volume of a beer Maß at Oktoberfest?',
        image: '/assets/img/Pre-test/beer.jpg',
        options: ['0.5 L', '1 L', '1.5 L', '2 L'],
        answer: '1 L',

        difficulty: 'medium' as Difficulty,
        domain: 'festival_culture' as QuestionDomain,
        explanation:
          'Checks knowledge of Oktoberfest beer culture, where the standard Maßkrug holds one liter of beer.',
        sources: [
          'https://www.paulaner-shop.de/en/1.0-l-glass-mug/PB05000',
          'https://www.germansteins.com/frankfurt-dimpled-oktoberfest-glass-beer-mug-1-liter/',
        ],
      },
    ];
    // Extract wrongly answered questions with metadata
    const wrongQuestions = questions.filter((q) =>
      userGame.pretestWrongQuestionIds?.includes(q.id),
    );
    const wrongQuestionsJson = JSON.stringify(
      wrongQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        domain: q.domain,
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
      null,
      2,
    );

    const pretestBankJson = JSON.stringify(questions, null, 2);
    // === 🎯 ADVANCED PERSONALIZED PROMPT
    const prompt = `
You are an AI game designer creating a *customized learning level* for a user learning about **German food culture**.

You are given the full **pre-test question bank** that the user has already answered.
Each item includes domains, explanations and sources that you should use as *reference material* and *topic inspiration*:

PRETEST_BANK (already used by the player):
${pretestBankJson}

🧪 **Pre-Test Diagnostic Summary (Very Important)**

The user has already completed the pre-test.
Below is a list of the **specific pre-test questions the user answered incorrectly**.
These represent **knowledge gaps or weaker areas** that should influence how you design the next level.

WRONG_PRETEST_QUESTIONS:
${wrongQuestionsJson}

📌 **How to use this diagnostic data**
- Treat these items as the user’s **primary weaknesses**.
- Pay special attention to their:
  - domain (topic area)
  - difficulty
  - explanation (what concept the user struggled with)
- In the new questions you generate:
  - Reinforce these weak areas using **simpler wording**, **clear examples**, or **a different angle**.
  - Do NOT repeat or rephrase the same question.
  - Re-teach the idea implicitly through new questions.
- If multiple wrong questions share the same domain:
  - Increase focus on that domain in this level.

Your goal now is to generate **6 new multiple-choice questions** that:
- Fit this specific user.
- Build on the same cultural topics and sources.
- Do **not** repeat or slightly reword any question from PRETEST_BANK.

💡 **User Profile Summary**
- Name: ${user.firstName} ${user.lastName}
- Nationality: ${userInfo.nationality ?? 'not specified'}
- Age: ${userInfo.age ?? 'not specified'}
- Gender: ${userInfo.gender ?? 'not specified'}
- German Level: ${userInfo.germanLevel ?? 'not specified'}
- Previous Experience with German culture/food: ${
      userInfo.previousExperience ?? 'not specified'
    }

- Learning Goal: ${userInfo.goal ?? 'not specified'}
- Favorite Cuisine: ${userInfo.favoriteCuisine ?? 'not specified'}
- Region Preference inside Germany: ${regionText}

🎮 **User Game Info**
- Pre-test score: ${userGame.pretestScore}/10
- Current level (overall skill label or numeric level): ${userGame.userLevel}

🧠 **Design & Difficulty Guidelines**
- If the pre-test score is **low (< 6)**:
  - Prefer **easy** and **medium** questions.
  - Use very clear wording and focus on iconic dishes, basic habits and simple comparisons.
- If the pre-test score is **high (> 9)**:
  - Include more **medium** and **hard** questions.
  - You can ask about regional diversity, festival culture, and specialty products.
- If the user answered specific pre-test questions wrong:
  - Prioritize reinforcing those domains first.
  - Use easier difficulty for those domains, even if the overall score is high.
- Always connect at least some questions to the user’s background, for example:
  - Compare German food customs to those in ${
    userInfo.nationality ?? 'their home country'
  }.
  - Mention their age, nationality, or preferences (e.g. “As a ${
    userInfo.age ?? 'young'
  }-year-old from ${userInfo.nationality ?? 'your country'} who loves ${
    userInfo.favoriteCuisine ?? 'food'
  }…”).
  - Add questions that link German traditions with ${
    userInfo.nationality ?? 'their culture'
  } traditions in a fun way.
- You may include the user’s first name in the question text to make it feel personal and immersive.

📚 **Use of Sources & Existing Bank**
- Use PRETEST_BANK as a **map of topics** the user has already seen.
- Reuse or extend the *domains* and *kinds of sources* from the \`sources\` field (encyclopedias, cultural sites, tourism boards, well-known food blogs).
- You may cover the **same general themes** (e.g. Sauerkraut, Oktoberfest, Döner), but:
  - Do **not** create a new question that is basically the same as an existing one.
  - Change the angle (e.g. origin, typical side dish, regional variation, eating context) rather than re-asking the same fact.

🎨 **Style & UX (very important)**
- This is a **game**, not an exam.
- **Question text**:
  - Maximum **2 sentences**.
  - Friendly, simple, non-academic tone.
  - NO long story intros.
  - NO big hints or context paragraphs inside the question.
- **Hint**:
  - Optional, **max 1 short sentence**.
  - Friendly and supportive (e.g. “Think about what Germans eat on Sundays.”).
- **Explanation**:
  - Between **1 and 3 short sentences**.
  - Explain *why* the correct answer is right, possibly adding a tiny cultural detail.
  - No long paragraphs, no walls of text.

🧩 **Question Content Rules**
- You must generate **exactly 6 questions**.
- Each question must have **exactly 4 answer choices**.
- Only **one** answer is correct.
- Vary difficulty: include a mix of **easy**, **medium**.
- don't make it very hard because this is only level 1 and is called warm up level so we want the user to like it and fell more easier so he gain confidence in himself.
- Stay inside these domains:
  - "iconic_dishes"
  - "ingredients"
  - "street_food"
  - "regional_diversity"
  - "eating_habits"
  - "festival_culture"
  - "specialty_product"
- Avoid ultra-obscure trivia that almost nobody could know.
- Focus on **meaningful cultural knowledge** that helps the learner understand German food culture in a practical and fun way.

📦 **Output format (JSON only)**

Return **only** a JSON array with **6 objects**, each following this schema:

[
  {
    "id": "q1",
    "question": "string (max 2 sentences)",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "hint": "short hint (max 1 sentence, can be empty or null)",
    "explanation": "1–3 short sentences explaining why the correct answer is right.",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Do NOT include any Markdown, commentary, explanation of your process, or extra keys.
Return **only** the JSON array.
`;

    try {
      // 🔥 Call Gemini
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // ✅ Extract text safely
      const rawText =
        response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const cleanText = rawText
        .replace(/```json/i, '')
        .replace(/```/g, '')
        .trim();

      // ✅ Parse JSON safely
      let questions;
      try {
        questions = JSON.parse(cleanText);
      } catch {
        console.warn('⚠️ Could not parse JSON. Returning raw text.');
        questions = cleanText;
      }

      // ✅ Save to MongoDB
      const newLevel = new this.level1Model({
        email,
        questions,
        modelUsed: 'gemini-2.0-flash',
        generatedAt: new Date(),
      });
      await newLevel.save();

      return {
        debug: true,
        email,
        prompt,
        newLevel,
      };
    } catch (err) {
      console.error('❌ Gemini Error:', err);
      throw new Error('Gemini API call failed.');
    }
  }
  // src/ai/ai.service.ts
  async getLevel1ByEmail(email: string) {
    const level = await this.level1Model.findOne({ email });

    if (!level) {
      throw new Error(`No Level 1 found for user with email: ${email}`);
    }

    return level;
  }
  async createLevel2(email: string) {
    const user = await this.userService.findByEmail(email);
    const userInfo = await this.userInfoService.getUserInfoByEmail(email);
    const userGame = await this.userGameService.getUserGameByEmail(email);

    if (!user || !userInfo || !userGame)
      throw new Error('Missing user data for Level 2 creation');

    // Check if already generated
    const existing = await this.level2Model.findOne({ email });
    if (existing) return existing;

    // ✅ same types as Level 1
    type Difficulty = 'easy' | 'medium' | 'hard';
    type QuestionDomain =
      | 'iconic_dishes'
      | 'ingredients'
      | 'street_food'
      | 'regional_diversity'
      | 'eating_habits'
      | 'festival_culture'
      | 'specialty_product';

    // ✅ SAME pretest bank as Level 1 (reuse / copy or import)
    const questions = [
      {
        id: 1,
        type: 'image',
        question: 'What is this dish typically served with?',
        image: '/assets/img/Pre-test/bratwurst.jpg',
        options: [
          'Bread roll & mustard',
          'Potato salad',
          'Sauerkraut & potatoes',
          'Bread with ketchup',
        ],
        answer: 'Bread roll & mustard',
        difficulty: 'easy' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Tests whether the learner knows the typical serving style of German bratwurst as a street snack (Brötchen + mustard).',
        sources: [
          'https://en.wikipedia.org/wiki/Bratwurst',
          'https://festwirt.de/en/bratwursts-and-its-different-varieties/',
        ],
      },

      {
        id: 2,
        type: 'text',
        question: 'What is the main ingredient in Sauerkraut?',
        options: ['White cabbage', 'Red cabbage', 'Cucumber', 'Turnip'],
        answer: 'White cabbage',
        difficulty: 'medium' as Difficulty,
        domain: 'ingredients' as QuestionDomain,
        explanation:
          'Checks basic knowledge that Sauerkraut is fermented cabbage, a core stereotype of German cuisine.',
        sources: [
          'https://en.wikipedia.org/wiki/Sauerkraut',
          'https://elavegan.com/how-to-make-sauerkraut/',
        ],
      },

      {
        id: 3,
        type: 'image',
        question: 'What is the name of this baked item?',
        image: '/assets/img/Pre-test/pretzel.jpg',
        options: ['Brezel', 'Laugenstange', 'Kaisersemmel', 'Schrippe'],
        answer: 'Brezel',

        difficulty: 'easy' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Measures recognition of the Brezel/pretzel as an iconic German baked good, especially in Bavaria and at Oktoberfest.',
        sources: [
          'https://en.wikipedia.org/wiki/Pretzel',
          'https://germanfoods.org/german-food-facts/all-hail-the-humble-pretzel-an-oktoberfest-classic/',
        ],
      },

      {
        id: 4,
        type: 'imageGrid',
        question: 'Which is Germany’s most popular street food today?',
        imageOptions: [
          { src: '/assets/img/Pre-test/doner.jpg', label: 'Döner Kebab' },
          { src: '/assets/img/Pre-test/Currywurst.jpg', label: 'Currywurst' },
          {
            src: '/assets/img/Pre-test/bratwurst.jpg',
            label: 'Bratwurst with roll',
          },
          {
            src: '/assets/img/Pre-test/Leberkäse sandwich.jpg',
            label: 'Leberkäse sandwich',
          },
        ],
        answer: 'Döner Kebab',

        difficulty: 'medium' as Difficulty,
        domain: 'street_food' as QuestionDomain,
        explanation:
          'Assesses awareness of modern German street food culture and migration influence, where Döner has overtaken Currywurst in popularity.',
        sources: [
          'https://adventure.com/gemany-fast-food-turkish-doner-kebab/',
          'https://www.aa.com.tr/en/culture/doner-kebab-is-more-popular-than-currywurst-in-germany-survey-finds/2774790',
        ],
      },

      {
        id: 5,
        type: 'text',
        question: 'How is Sauerbraten traditionally prepared?',
        options: [
          'Marinated & roasted',
          'Smoked & grilled',
          'Pan-fried',
          'Steamed',
        ],
        answer: 'Marinated & roasted',
        difficulty: 'medium' as Difficulty,
        domain: 'iconic_dishes' as QuestionDomain,
        explanation:
          'Tests deeper knowledge that Sauerbraten is a marinated pot roast, usually beef, slowly roasted after several days in a vinegar/wine marinade.',
        sources: [
          'https://en.wikipedia.org/wiki/Sauerbraten',
          'https://daysofjay.com/2022/11/18/real-german-sauerbraten/',
        ],
      },

      {
        id: 6,
        type: 'matching',
        question:
          'Match the correct potato salad style to its region (South vs North).',
        pairs: [
          {
            id: 'south',
            label: 'Southern Germany',
            image: '/assets/img/Pre-test/kartoffelsalat_south.png',
          },
          {
            id: 'north',
            label: 'Northern Germany',
            image: '/assets/img/Pre-test/kartoffelsalat_north.png',
          },
        ],
        difficulty: 'hard' as Difficulty,
        domain: 'regional_diversity' as QuestionDomain,
        explanation:
          'Captures knowledge of regional differences in everyday foods: northern Kartoffelsalat is mayo-based, southern versions use broth or vinegar-oil.',
        sources: [
          'https://www.tastingtable.com/926829/what-makes-german-potato-salad-different-from-american/',
          'https://www.reddit.com/r/germany/comments/7v1chy/is_german_potato_salad_a_traditional_dish/',
        ],
      },

      {
        id: 7,
        type: 'text',
        question: 'Traditionally, when do Germans eat their main warm meal?',
        options: ['Early morning', 'Midday', 'Late evening', 'After midnight'],
        answer: 'Midday',
        difficulty: 'medium' as Difficulty,
        domain: 'eating_habits' as QuestionDomain,
        explanation:
          'Measures understanding of traditional eating habits where the main hot meal (Mittagessen) is eaten around noon.',
        sources: [
          'https://en.wikipedia.org/wiki/German_cuisine',
          'https://germanfoods.org/german-food-facts/breakfast-lunch-dinner-snacks/',
        ],
      },

      {
        id: 8,
        type: 'matching',
        question: 'Match each dish to its region in Germany.',
        pairs: [
          {
            id: 'bavaria',
            label: 'Weißwurst (Bavaria)',
            image: '/assets/img/Pre-test/Weisswurst.png',
          },
          {
            id: 'north',
            label: 'Labskaus (Northern Germany)',
            image: '/assets/img/Pre-test/LabsKaus.png',
          },
          {
            id: 'swabia',
            label: 'Spätzle (Swabia)',
            image: '/assets/img/Pre-test/Spätzle.png',
          },
        ],

        difficulty: 'hard' as Difficulty,
        domain: 'regional_diversity' as QuestionDomain,
        explanation:
          'Assesses regional food culture knowledge by linking Weißwurst to Bavaria, Labskaus to Northern Germany, and Spätzle to Swabia.',
        sources: [
          'https://www.discover-bavaria.com/Inspiration/bavarian-specialities',
          'https://en.wikipedia.org/wiki/Labskaus',
          'https://en.wikipedia.org/wiki/Sp%C3%A4tzle',
        ],
      },
      {
        id: 9,
        type: 'imageGrid',
        question: 'Which of the following cheeses is Milbenkäse?',
        imageOptions: [
          { src: '/assets/img/Pre-test/Milbenkäse.jpg', label: 'Milbenkäse' },
          { src: '/assets/img/Pre-test/brie.jpg', label: 'Brie' },
          { src: '/assets/img/Pre-test/emmental.jpg', label: 'Emmental' },
          { src: '/assets/img/Pre-test/Gouda.jpg', label: 'Gouda' },
        ],
        answer: 'Milbenkäse',
        difficulty: 'hard' as Difficulty,
        domain: 'specialty_product' as QuestionDomain,
        explanation:
          'Tests advanced knowledge of a rare German specialty cheese from Würchwitz that is ripened with cheese mites.',
        sources: [
          'https://en.wikipedia.org/wiki/Milbenk%C3%A4se',
          'https://www.atlasobscura.com/places/cheese-mite-memorial',
        ],
      },
      {
        id: 10,
        type: 'image',
        question: 'What is the volume of a beer Maß at Oktoberfest?',
        image: '/assets/img/Pre-test/beer.jpg',
        options: ['0.5 L', '1 L', '1.5 L', '2 L'],
        answer: '1 L',

        difficulty: 'medium' as Difficulty,
        domain: 'festival_culture' as QuestionDomain,
        explanation:
          'Checks knowledge of Oktoberfest beer culture, where the standard Maßkrug holds one liter of beer.',
        sources: [
          'https://www.paulaner-shop.de/en/1.0-l-glass-mug/PB05000',
          'https://www.germansteins.com/frankfurt-dimpled-oktoberfest-glass-beer-mug-1-liter/',
        ],
      },
    ];

    // ✅ Extract wrong questions exactly like Level 1
    const wrongQuestions = questions.filter((q) =>
      userGame.pretestWrongQuestionIds?.includes(q.id),
    );

    const wrongQuestionsJson = JSON.stringify(
      wrongQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        domain: q.domain,
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
      null,
      2,
    );

    const pretestBankJson = JSON.stringify(questions, null, 2);

    // 🎯 Region
    const region = this.formatRegion(userInfo.regionPreference);

    // ✅ NEW Level 2 prompt (Level1 style)
    const prompt = `
You are an AI game designer creating a *customized learning level* for a user learning about **German food culture**.

This is **Level 2 (Sorting Game)**.
The user already completed the PRE-TEST and Level 1.
Level 2 must be generated based on the learner’s weaknesses and their chosen region, while staying fun and confidence-building.

========================
PRETEST_BANK (already used by the player):
${pretestBankJson}

🧪 Pre-Test Diagnostic Summary (Very Important)
The user answered some pre-test questions incorrectly. These show the user's knowledge gaps.

WRONG_PRETEST_QUESTIONS:
${wrongQuestionsJson}

📌 How to use this diagnostic data (critical)
- Focus your card choices to reinforce the weak domains from WRONG_PRETEST_QUESTIONS.
- Do NOT repeat the same questions. Instead, teach the concepts through the cards.
- Example: if the user struggled with "regional_diversity", choose correct foods that clearly signal the region.
- Keep this level easier than a test.
- Try to keep the wrong dishes also german but if the user scores is bad make it easier on him if not try to make it  tricky.

========================
📍 USER REGION
Selected region(s): **${region}**
If multiple regions are listed, blend their food cultures naturally.
If unclear, choose the nearest culturally meaningful German region.

========================
🎮 USER GAME INFO
- Pre-test score: ${userGame.pretestScore} out of 10
- Level 1 score: ${userGame.level1Score} out of 6
- Current user level: ${userGame.userLevel}

========================
🎯 LEVEL 2 GAME GOAL
Generate EXACTLY 10 cards:
- 6 CORRECT foods from the chosen region
- 4 WRONG / IMPOSTER foods (not from that region; can be non-German depending on difficulty)

Every card must include:
- emoji (a real existing food emoji)
- label (food name)
- isCorrect (true/false)
- origin (short culturally accurate origin)
- info (NEW)

========================
🧠 DIFFICULTY ADAPTATION
BEGINNER:
- Pre-test < 4 AND Level 1 < 3
- Use iconic regional foods.
- Wrong foods should be very obvious.

INTERMEDIATE:
- Pre-test 4–7 OR Level 1 >= 3
- Use more regional specialties.
- Wrong foods can be believable (similar European foods).

ADVANCED:
- Pre-test > 7 OR Level 1 >= 5
- Use deeper regional foods, but keep it fair.
- Wrong foods can be tricky (Austrian/Swiss look-alikes).

Fairness:
- This is warm-up: keep it enjoyable.
- If region is Berlin, avoid ultra-obscure foods.

========================
🧩 SUPER STRICT EMOJI RULES (CRITICAL)
- ONLY use foods that have a clear, standard matching food emoji.
- The emoji must represent the actual dish, not an ingredient.
  BAD example: using 🥔 for "Kartoffelsalat".
  BAD example: using 🍞 for any sandwich.
- If a dish does not have a good matching emoji, DO NOT use it.
- Make sure to ot use the same emoji twice because this makes the user get confused.
  Replace it with another region-appropriate food that DOES have a proper emoji.
- Do NOT invent emojis.
- Do NOT use random emojis (🧪🚀🎯 etc.).

✅ Safe emoji examples:
🥨 pretzel, 🌭 sausage/hot dog, 🍺 beer, 🥟 dumpling-style,
🥞 pancake-style, 🍞 bread, 🧀 cheese, 🥗 salad, 🍲 stew/soup,
🍖 roast/meat dish, 🍰 cake, 🍩 pastry, 🍎 fruit, 🐟 fish.

========================
📌 EXTRA LEARNING INFO (NEW)
For EVERY card add an "info" field:
- If isCorrect = true → 1 short sentence explaining WHY it belongs to the chosen region.
- If isCorrect = false → info must be exactly "" (empty string).

Rules for info:
- Max 14 words.
- One sentence only
- Simple English
- No personal data
- Must mention a regional clue (city, tradition, local style, famous place, etc.)

========================
📦 OUTPUT FORMAT (STRICT JSON ONLY — NO MARKDOWN)
Return ONLY a JSON array with EXACTLY 10 items:

[
  {
    "emoji": "🌭",
    "label": "Currywurst",
    "isCorrect": true,
    "origin": "Berlin, Germany",
    "info": "Berlin street-food classic, popular at stands across the city."
  }
]

No extra text. No markdown. No comments. JSON must parse.
`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const raw =
        response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const clean = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      let cards;
      try {
        cards = JSON.parse(clean);
      } catch {
        cards = clean;
      }

      const newLevel = new this.level2Model({
        email,
        region,
        theme: `Regional Food Sorting (${region})`,
        difficulty: 'medium',
        cards,
        modelUsed: 'gemini-2.5-flash',
        generatedAt: new Date(),
      });

      await newLevel.save();
      return newLevel;
    } catch (e) {
      console.error('Level 2 AI error:', e);
      throw new Error('Failed to generate Level 2');
    }
  }
  async getLevel2ByEmail(email: string) {
    const level = await this.level2Model.findOne({ email });
    if (!level) throw new Error(`No Level 2 found for ${email}`);
    return level;
  }
  async createLevel3(email: string) {
    const user = await this.userService.findByEmail(email);
    const userInfo = await this.userInfoService.getUserInfoByEmail(email);
    const userGame = await this.userGameService.getUserGameByEmail(email);

    if (!user || !userInfo || !userGame)
      throw new Error('Missing user data for Level 3 creation');

    // Check if already generated
    const existing = await this.level3Model.findOne({ email });
    if (existing) return existing;

    // ✅ same types as Level 1 & 2
    type Difficulty = 'easy' | 'medium' | 'hard';
    type QuestionDomain =
      | 'iconic_dishes'
      | 'ingredients'
      | 'street_food'
      | 'regional_diversity'
      | 'eating_habits'
      | 'festival_culture'
      | 'specialty_product';

    // ✅ SAME pretest bank (reuse)
    const questions = [
      /* ... EXACT same pretest bank ... */
    ];

    // ✅ Extract wrong pretest questions (same as Level 2)
    const wrongQuestions = questions.filter((q) =>
      userGame.pretestWrongQuestionIds?.includes(q.id),
    );

    const wrongQuestionsJson = JSON.stringify(
      wrongQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        domain: q.domain,
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
      null,
      2,
    );

    const pretestBankJson = JSON.stringify(questions, null, 2);

    // 🎯 Region (used for dish flavoring)
    const region = this.formatRegion(userInfo.regionPreference);

    // ✅ LEVEL 3 PROMPT (SAME STRUCTURE AS LEVEL 2)
    const prompt = `
You are an AI game designer creating a *customized learning level* for a user learning about **German food culture**.

This is **Level 3 (Tradition Feast – Ingredient Builder)**.
The user already completed the PRE-TEST, Level 1, and Level 2.
Level 3 must build on their weaknesses and previous gameplay, while staying fun and confidence-building.

========================
PRETEST_BANK (already used by the player):
${pretestBankJson}

🧪 Pre-Test Diagnostic Summary (Very Important)
The user answered some pre-test questions incorrectly.
These questions reveal gaps in understanding ingredients, iconic dishes, and regional food structure.

WRONG_PRETEST_QUESTIONS:
${wrongQuestionsJson}

📌 How to use this diagnostic data (critical)
- Focus on dishes and ingredients related to weak domains.
- Do NOT repeat pretest questions.
- Teach concepts through ingredient choices.
- Example:
  - If the user struggled with "ingredients", make correct ingredients very clear.
  - If they struggled with "iconic_dishes", use very recognizable dishes.
- Keep this level easier than a test, but not trivial.

========================
🎮 LEVEL 2 CONTEXT (IMPORTANT)
Level 2 trained the user to:
- Recognize German foods visually
- Decide if a food belongs to a region
- Reject imposters

Level 3 goes deeper:
- From recognizing foods → understanding what belongs **inside** a dish.

========================
📍 USER REGION
Selected region(s): **${region}**
If multiple regions are listed, blend their food cultures naturally.
Use this to slightly influence dish style when possible.

========================
🎮 USER GAME INFO
- Pre-test score: ${userGame.pretestScore} out of 10
- Level 1 score: ${userGame.level1Score} out of 6
- Level 2 score: ${userGame.level2Score} out of 10
- Current user level: ${userGame.userLevel}

========================
🎯 LEVEL 3 GAME GOAL
Generate EXACTLY **3 dishes**.

For EACH dish generate EXACTLY **6 ingredient cards**:
- 3 CORRECT ingredients that belong to the dish
- 3 WRONG / IMPOSTER ingredients that do NOT belong

Every card must include:
- emoji (real existing food emoji)
- label (ingredient name)
- isCorrect (true/false)
- origin (short culturally accurate origin)
- info (NEW)

========================
🧠 DIFFICULTY ADAPTATION
BEGINNER:
- Pre-test < 4 AND Level 2 < 4
- Use very iconic dishes.
- Ingredients should be obvious.
- Imposters should be very obvious (e.g., Sushi, Tacos).

INTERMEDIATE:
- Pre-test 4–7 OR Level 2 >= 4
- Use common traditional dishes.
- Imposters can be plausible but wrong.

ADVANCED:
- Pre-test > 7 OR Level 2 >= 7
- Use slightly richer dishes.
- Imposters can be tricky but fair.

Fairness:
- This is still learning, not an exam.
- Avoid chef-level complexity.

========================
🧩 SUPER STRICT EMOJI RULES (CRITICAL)
- ONLY use foods with clear matching emojis.
- Emoji must represent the ingredient itself.
- Do NOT reuse the same emoji inside one dish.
- If no good emoji exists, replace the ingredient.
- Do NOT invent emojis.
- Do NOT use non-food emojis.
-Also please do each ingredient name at max 2 words and if it possible to do it in one do it so please do not exceed this very important!
========================
📌 EXTRA LEARNING INFO (NEW)
For EVERY card add an "info" field:
- If isCorrect = true → explain WHY this ingredient belongs.
- If isCorrect = false → info must be exactly "".

Rules for info:
- Max 14 words
- One sentence
- Simple English
- No personal data
- Explain cultural or dish logic

========================
📦 OUTPUT FORMAT (STRICT JSON ONLY — NO MARKDOWN)
Return ONLY a JSON array with EXACTLY 3 items:

[
  {
    "name": "Dish Name",
    "cards": [
      {
        "emoji": "🌭",
        "label": "Grilled sausage",
        "isCorrect": true,
        "origin": "Germany",
        
      }
    ]
  }
]

No extra text. No markdown. No comments. JSON must parse.
`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const raw =
        response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const clean = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const dishes = JSON.parse(clean);

      const newLevel = new this.level3Model({
        email,
        theme: 'Tradition Feast',
        difficulty: 'medium',
        dishes,
        modelUsed: 'gemini-2.5-flash',
        generatedAt: new Date(),
      });

      await newLevel.save();
      return newLevel;
    } catch (e) {
      console.error('Level 3 AI error:', e);
      throw new Error('Failed to generate Level 3');
    }
  }

  async getLevel3ByEmail(email: string) {
    const level = await this.level3Model.findOne({ email });
    if (!level) throw new Error(`No Level 3 found for ${email}`);
    return level;
  }
}
