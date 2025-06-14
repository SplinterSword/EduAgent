// src/ai/flows/ai-chat-tutor.ts
'use server';

/**
 * @fileOverview AI Chat Tutor for answering questions and helping with revision on course material.
 *
 * - aiChatTutor - A function that handles the chat tutor process.
 * - AiChatTutorInput - The input type for the aiChatTutor function.
 * - AiChatTutorOutput - The return type for the aiChatTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatTutorInputSchema = z.object({
  question: z.string().describe('The question to ask the AI Chat Tutor.'),
  courseMaterial: z.string().describe('The course material to use for answering the question.'),
});
export type AiChatTutorInput = z.infer<typeof AiChatTutorInputSchema>;

const AiChatTutorOutputSchema = z.object({
  answer: z.string().describe('The answer to the question from the AI Chat Tutor.'),
});
export type AiChatTutorOutput = z.infer<typeof AiChatTutorOutputSchema>;

export async function aiChatTutor(input: AiChatTutorInput): Promise<AiChatTutorOutput> {
  return aiChatTutorFlow(input);
}

const aiChatTutorPrompt = ai.definePrompt({
  name: 'aiChatTutorPrompt',
  input: {schema: AiChatTutorInputSchema},
  output: {schema: AiChatTutorOutputSchema},
  prompt: `You are an AI Chat Tutor helping a student with revision on course material.

  Course Material: {{{courseMaterial}}}

  Answer the following question using the course material provided:

  Question: {{{question}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const aiChatTutorFlow = ai.defineFlow(
  {
    name: 'aiChatTutorFlow',
    inputSchema: AiChatTutorInputSchema,
    outputSchema: AiChatTutorOutputSchema,
  },
  async input => {
    const {output} = await aiChatTutorPrompt(input);
    return output!;
  }
);
