import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/suggest-resources.ts';
import '@/ai/flows/generate-quizzes.ts';
import '@/ai/flows/ai-chat-tutor.ts';