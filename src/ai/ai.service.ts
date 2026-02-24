import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('ai.openaiApiKey'),
    });
    this.model = this.config.get<string>('ai.model') ?? 'gpt-4o-mini';
  }

  // ─── PRIVATE HELPER ───────────────────────────────────────────────────────

  private async jsonCompletion<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });
    const content = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(content) as T;
  }

  // ─── PUBLIC METHODS ───────────────────────────────────────────────────────

  async generateFlashcardsFromText(
    params: GenerateFlashcardsParams,
  ): Promise<GeneratedFlashcard[]> {
    this.logger.debug(`generateFlashcardsFromText – text length ${params.text.length}`);

    const result = await this.jsonCompletion<{ flashcards: GeneratedFlashcard[] }>(
      `You are a Vietnamese language teacher. Extract vocabulary from the provided text and return a JSON object with a "flashcards" array. Each item must have: word (string), pronunciation (string - phonetic guide for English speakers), meaning (string - English translation), partOfSpeech (string - one of: noun, verb, adjective, adverb, pronoun, phrase, expression, interjection), exampleSentence (string - a Vietnamese sentence using the word).`,
      `Extract the most important Vietnamese vocabulary from this text:\n\n${params.text}`,
    );

    return result.flashcards ?? [];
  }

  async checkSentence(params: CheckSentenceParams): Promise<CheckSentenceResult> {
    this.logger.debug(`checkSentence – level=${params.level} sentence="${params.userSentence}"`);

    return this.jsonCompletion<CheckSentenceResult>(
      `You are a Vietnamese language tutor. Evaluate the user's Vietnamese sentence and return a JSON object with: isCorrect (boolean), correctedSentence (string), grammarExplanation (string - brief explanation in English), score (number 0-100).`,
      `User level: ${params.level}. Evaluate this Vietnamese sentence: "${params.userSentence}"`,
    );
  }

  async generatePatternDrills(params: GeneratePatternDrillsParams): Promise<PatternDrill[]> {
    this.logger.debug(`generatePatternDrills – topic=${params.topic ?? 'general'}`);

    const result = await this.jsonCompletion<{ drills: PatternDrill[] }>(
      `You are a Vietnamese language teacher. Generate pattern drills and return a JSON object with a "drills" array. Each drill must have: type ("shuffle" | "cloze" | "translate"), prompt (string), answer (string), and optionally hint (string).`,
      `Generate 5 Vietnamese pattern drills for level ${params.level ?? 'A1'}, topic: "${params.topic ?? 'general conversation'}", pattern: "${params.pattern ?? 'basic sentences'}".`,
    );

    return result.drills ?? [];
  }

  async chatReply(params: ChatReplyParams): Promise<ChatReplyResult> {
    const { userMessage, history, sessionHistory, mode, level } = params;
    const chatHistory = history ?? sessionHistory ?? [];
    this.logger.debug(`chatReply – mode=${mode} level=${level} msg="${userMessage}"`);

    const systemPrompts: Record<string, string> = {
      explain: `You are a Vietnamese language tutor who explains everything in depth. The student is at level ${level}. For every message, explain the Vietnamese words, grammar structures, and cultural context. Break down sentences word by word when helpful. Be thorough and educational. Return JSON: { text: string, suggestions: string[] }`,
      correct: `You are a strict Vietnamese language teacher. The student is at level ${level}. Interrupt and correct every grammar mistake, tone error, and vocabulary choice. Be direct and precise. Always show the corrected version. Return JSON: { text: string, corrections: string[] }`,
      free: `You are a friendly Vietnamese conversation partner. The student is at level ${level}. Have casual, natural conversation. Only gently mention major errors without breaking the flow. Keep responses concise and conversational. Return JSON: { text: string }`,
    };

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompts[mode] ?? systemPrompts['free'] },
      ...chatHistory.map((m) => ({
        role: m.role.toLowerCase() as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await this.openai.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content ?? '{"text":"Sorry, I could not generate a response."}';
    return JSON.parse(content) as ChatReplyResult;
  }

  async generateQuiz(params: GenerateQuizParams): Promise<QuizQuestion[]> {
    this.logger.debug(`generateQuiz – level=${params.userLevel} topics=${params.topics.join(',')}`);

    const result = await this.jsonCompletion<{ questions: QuizQuestion[] }>(
      `You are a Vietnamese language quiz generator for English-speaking learners. Return a JSON object with a "questions" array. Each question must have: id (string), type ("multiple_choice"), prompt (string - ALWAYS written in English, e.g. "What does 'xin chào' mean?"), options (array of {id: string, text: string} with 4 options using ids "a","b","c","d"), correctOptionId (string matching one option id). The answer options can contain Vietnamese words when appropriate. Generate DIFFERENT questions every time — do not repeat questions from previous sessions.`,
      `Generate 5 multiple-choice Vietnamese quiz questions for level ${params.userLevel}, covering topics: ${params.topics.join(', ')}. Variation seed: ${params.seed ?? Math.random()}.`,
    );

    return result.questions ?? [];
  }

  async generateLessonFromContent(params: GenerateLessonParams): Promise<GeneratedLesson> {
    this.logger.debug(`generateLessonFromContent – type=${params.inputType} topic=${params.topic ?? ''}`);

    const prompt = params.inputType === 'text'
      ? `Create a Vietnamese lesson for level ${params.level ?? 'beginner'} from this text:\n\n${params.text}`
      : `Create a Vietnamese lesson for level ${params.level ?? 'beginner'} about the topic: "${params.topic}".`;

    return this.jsonCompletion<GeneratedLesson>(
      `You are a Vietnamese language curriculum designer. Return a JSON object with: vocab (array of {word, pronunciation, meaning}), examples (array of Vietnamese example strings), exercises (array of {type: "translate"|"cloze"|"shuffle", prompt, answer}).`,
      prompt,
    );
  }
}
