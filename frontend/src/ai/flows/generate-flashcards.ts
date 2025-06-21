'use server';

/**
 * @fileOverview Flow to generate flashcards from uploaded course materials.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import { extractJsonFromResponse } from './flow_utils';

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

const GenerateFlashcardsInputSchema = z.object({
  courseMaterial: z
    .string()
    .describe('The course material to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(z.object({front: z.string(), back: z.string()}))
    .describe('The generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput, userId: string, sessionId: string): Promise<GenerateFlashcardsOutput> {
  
  // Use ADK /run endpoint with configurable backend URL
  const ADK_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";
  console.log("ADK_URL: ", ADK_URL, "userId: ", userId, "sessionId: ", sessionId)
  try {
    const res = await fetch(`${ADK_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appName: "EduAssistant_Agents",
        userId: userId,
        sessionId: sessionId,
        newMessage: {
          role: "user",
          parts: [{
            text: `Create flashcards for this content. Please format your response as a JSON object with a 'flashcards' array. Each flashcard should have a 'front' (string) and 'back' (string) field. Here's the content: ${input.courseMaterial}\n\nFormat your response as: {\"flashcards\": [{\"front\": \"...\", \"back\": \"...\"}]}`
          }]
        }
      })
    });
    if (!res.ok) throw new Error(`Failed to generate flashcards from backend agent: ${res.status}`);

    const output = (await res.json())[0]?.content?.parts?.[0]?.text;
    const data = await extractJsonFromResponse(output);

    // ADK returns response in data.output
    let result;
    try {
      result = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      result = data;
    }
    // Ensure the response matches our expected schema
    if (result.flashcards && Array.isArray(result.flashcards)) {
      return result;
    } else if (Array.isArray(result)) {
      return { flashcards: result };
    } else {
      throw new Error('Invalid flashcards format received from agent');
    }
  } catch (error) {
    console.error('Flashcard generation error:', error);
    // Fallback to local Genkit flow if ADK fails
    try {
      return await generateFlashcardsFlow(input);
    } catch (fallbackError) {
      console.error("Error in fallback implementation:", fallbackError);
      throw fallbackError;
    }
  }
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert educator. Generate a set of flashcards from the following course material. Each flashcard should have a front and a back.

Course Material:
{{{courseMaterial}}}

Ensure that the flashcards cover the key concepts and definitions from the material. The output must be a JSON array of {"front": string, "back": string} objects.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
