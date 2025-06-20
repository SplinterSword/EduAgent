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
import { extractJsonFromResponse } from './flow_utils';

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
  // Use ADK /run endpoint with configurable backend URL
  const ADK_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${ADK_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: `Generate ${input.numQuestions} quiz questions based on this content: ${input.courseMaterial}`,
        metadata: {
          request_type: "quizzes",
          course_material: input.courseMaterial,
          output_schema: {
            type: "object",
            properties: {
              quiz: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    correctAnswer: { type: "string" }
                  },
                  required: ["question", "options", "correctAnswer"]
                }
              }
            },
            required: ["quiz"]
          }
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to generate quizzes: ${res.statusText}`);
    }

    const data = await extractJsonFromResponse(await res.text());
    let result;
    try {
      result = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      result = data;
    }
    // Ensure the response matches our expected schema
    if (!GenerateQuizzesOutputSchema.safeParse(result).success) {
      throw new Error("Failed to parse response as GenerateQuizzesOutput");
    }
    return result;
  } catch (error) {
    console.error("Error generating quizzes:", error);
    try {
      // Fall back to the local implementation if the API call fails
      return await generateQuizzesFlow(input);
    } catch (fallbackError) {
      console.error("Error in fallback implementation:", fallbackError);
      throw fallbackError;
    }
  }
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
