// ──────────────────────────────────────────────
//  Shared AI interfaces
// ──────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ── generateFlashcardsFromText ────────────────
export interface GenerateFlashcardsParams {
  text: string;
  targetLanguage: 'vi';
}

export interface GeneratedFlashcard {
  word: string;
  pronunciation: string;
  meaning: string;
  partOfSpeech?: string; // noun | verb | adjective | adverb | pronoun | phrase | expression | interjection
  exampleSentence: string;
}

// ── checkSentence ─────────────────────────────
export interface CheckSentenceParams {
  userSentence: string;
  referenceSentence?: string;
  level: string;
}

export interface CheckSentenceResult {
  isCorrect: boolean;
  correctedSentence: string;
  grammarExplanation: string;
  score: number; // 0-100
}

// ── generatePatternDrills ─────────────────────
export interface GeneratePatternDrillsParams {
  topic?: string;
  patternId?: string;
  pattern?: string;
  level?: string;
}

export interface PatternDrill {
  type: 'shuffle' | 'cloze' | 'translate';
  prompt: string;
  answer: string;
  hint?: string;
}

// ── chatReply ─────────────────────────────────
export interface ChatReplyParams {
  sessionHistory?: ChatMessage[];
  history?: ChatMessage[];
  userMessage: string;
  mode: 'explain' | 'correct' | 'free';
  level: string;
}

export interface ChatReplyResult {
  text: string;
  corrections?: string[];
  suggestions?: string[];
}

// ── generateQuiz ──────────────────────────────
export interface GenerateQuizParams {
  userLevel: string;
  topics: string[];
  seed?: number; // random number added to prompt to prevent repeated questions
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening';
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
}

// ── generateLessonFromContent ─────────────────
export interface GenerateLessonParams {
  inputType: 'text' | 'topic';
  text?: string;
  topic?: string;
  level?: string;
}

export interface GeneratedVocabItem {
  word: string;
  pronunciation: string;
  meaning: string;
}

export interface GeneratedLesson {
  vocab: GeneratedVocabItem[];
  examples: string[];
  exercises: PatternDrill[];
}
