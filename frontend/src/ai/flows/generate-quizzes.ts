// src/ai/flows/generate-quizzes.ts
'use server';

/**
 * @fileOverview Generates quizzes from uploaded course materials.
 *
 * - generateQuizzes - A function that generates quizzes from course materials.
 * - GenerateQuizzesInput - The input type for the generateQuizzes function.
 * - GenerateQuizzesOutput - The return type for the generateQuizzes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizzesInputSchema = z.object({
  courseMaterial: z
    .string()
    .describe('The course material to generate quizzes from.'),
  numQuestions: z
    .number()
    .default(5)
    .describe('The number of questions to generate.'),
});
export type GenerateQuizzesInput = z.infer<typeof GenerateQuizzesInputSchema>;

const GenerateQuizzesOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers.'),
      correctAnswer: z.string().describe('The correct answer.'),
    })
  ),
});
export type GenerateQuizzesOutput = z.infer<typeof GenerateQuizzesOutputSchema>;

export async function generateQuizzes(
  input: GenerateQuizzesInput
): Promise<GenerateQuizzesOutput> {
  return generateQuizzesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizzesPrompt',
  input: {schema: GenerateQuizzesInputSchema},
  output: {schema: GenerateQuizzesOutputSchema},
  prompt: `You are an expert quiz generator. Generate {{numQuestions}} questions based on the following course material. Each question should have 4 possible answers, one of which is correct. The correct answer MUST be one of the options. Format the output as a JSON object.

Course Material: {{{courseMaterial}}}`,
});

const generateQuizzesFlow = ai.defineFlow(
  {
    name: 'generateQuizzesFlow',
    inputSchema: GenerateQuizzesInputSchema,
    outputSchema: GenerateQuizzesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
