import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatReplyParams,
  ChatReplyResult,
  CheckSentenceParams,
  CheckSentenceResult,
  GenerateFlashcardsParams,
  GeneratedFlashcard,
  GenerateLessonParams,
  GeneratedLesson,
  GeneratePatternDrillsParams,
  GenerateQuizParams,
  PatternDrill,
  QuizQuestion,
} from './interfaces/ai.interfaces';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  // ─────────────────────────────────────────────
  // TODO: Replace stub bodies with real OpenAI calls
  // e.g. await this.openai.chat.completions.create(...)
  // ─────────────────────────────────────────────

  async generateFlashcardsFromText(
    params: GenerateFlashcardsParams,
  ): Promise<GeneratedFlashcard[]> {
    this.logger.debug(
      `generateFlashcardsFromText – text length ${params.text.length}`,
    );

    // TODO: call OpenAI: prompt = "Extract Vietnamese vocab from: {text}. Return JSON array."
    return [
      {
        word: 'xin chào',
        pronunciation: 'sin chow',
        meaning: 'hello',
        exampleSentence: 'Xin chào, bạn có khỏe không?',
      },
      {
        word: 'cảm ơn',
        pronunciation: 'gam uhn',
        meaning: 'thank you',
        exampleSentence: 'Cảm ơn bạn rất nhiều.',
      },
    ];
  }

  async checkSentence(
    params: CheckSentenceParams,
  ): Promise<CheckSentenceResult> {
    this.logger.debug(
      `checkSentence – level=${params.level} sentence="${params.userSentence}"`,
    );

    // TODO: call OpenAI: prompt = "Grade this Vietnamese sentence: '{userSentence}'. Return JSON."
    const isCorrect = params.userSentence.trim().length > 5;
    return {
      isCorrect,
      correctedSentence: isCorrect
        ? params.userSentence
        : 'Tôi muốn học tiếng Việt.',
      grammarExplanation: isCorrect
        ? 'Your sentence is grammatically correct.'
        : 'The sentence is missing a subject or verb.',
      score: isCorrect ? 90 : 40,
    };
  }

  async generatePatternDrills(
    params: GeneratePatternDrillsParams,
  ): Promise<PatternDrill[]> {
    this.logger.debug(
      `generatePatternDrills – topic=${params.topic ?? 'general'}`,
    );

    // TODO: call OpenAI to generate pattern exercises
    return [
      {
        type: 'shuffle',
        prompt: 'Arrange: [học / tôi / muốn / tiếng Việt]',
        answer: 'Tôi muốn học tiếng Việt.',
      },
      {
        type: 'cloze',
        prompt: 'Tôi ___ ăn phở. (want)',
        answer: 'muốn',
        hint: 'desire verb',
      },
      {
        type: 'translate',
        prompt: 'Translate: "Where is the market?"',
        answer: 'Chợ ở đâu?',
      },
    ];
  }

  async chatReply(params: ChatReplyParams): Promise<ChatReplyResult> {
    const { userMessage, mode, level } = params;
    this.logger.debug(
      `chatReply – mode=${mode} level=${level} msg="${userMessage}"`,
    );

    // TODO: Build system prompt from mode + level, call OpenAI with session history
    const responses: Record<string, ChatReplyResult> = {
      explain: {
        text: `Great question! In Vietnamese (level ${level}), "${userMessage}" means... [AI explanation stub]`,
        suggestions: ['Try using this in a sentence.', 'Listen to the audio.'],
      },
      correct: {
        text: `Your sentence is almost correct! Here's a suggestion: "${userMessage}" → [corrected stub]`,
        corrections: ['Check tone marks on vowels.'],
      },
      free: {
        text: `Interesting! Let's continue talking about "${userMessage}". [AI free chat stub]`,
      },
    };

    return responses[mode] ?? responses['free'];
  }

  async generateQuiz(params: GenerateQuizParams): Promise<QuizQuestion[]> {
    this.logger.debug(
      `generateQuiz – level=${params.userLevel} topics=${params.topics.join(',')}`,
    );

    // TODO: call OpenAI to generate quiz questions
    return [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: 'What does "xin chào" mean?',
        options: [
          { id: 'a', text: 'Goodbye' },
          { id: 'b', text: 'Hello' },
          { id: 'c', text: 'Thank you' },
          { id: 'd', text: 'Sorry' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        prompt: 'How do you say "thank you" in Vietnamese?',
        options: [
          { id: 'a', text: 'xin chào' },
          { id: 'b', text: 'xin lỗi' },
          { id: 'c', text: 'cảm ơn' },
          { id: 'd', text: 'tạm biệt' },
        ],
        correctOptionId: 'c',
      },
    ];
  }

  async generateLessonFromContent(
    params: GenerateLessonParams,
  ): Promise<GeneratedLesson> {
    this.logger.debug(
      `generateLessonFromContent – type=${params.inputType} topic=${params.topic ?? ''}`,
    );

    // TODO: call OpenAI: "Generate a Vietnamese lesson for topic: {topic}. Return JSON."
    return {
      vocab: [
        { word: 'phở', pronunciation: 'fuh', meaning: 'Vietnamese noodle soup' },
        { word: 'bánh mì', pronunciation: 'bahn mee', meaning: 'Vietnamese baguette sandwich' },
      ],
      examples: [
        'Tôi muốn ăn một tô phở.',
        'Bánh mì này rất ngon.',
      ],
      exercises: [
        {
          type: 'translate',
          prompt: 'Translate: "I want to eat pho"',
          answer: 'Tôi muốn ăn phở.',
        },
      ],
    };
  }
}
