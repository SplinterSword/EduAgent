// src/ai/flows/suggest-resources.ts
'use server';
/**
 * @fileOverview A flow that suggests relevant study materials and videos related to the course content.
 *
 * - suggestResources - A function that suggests relevant study materials and videos.
 * - SuggestResourcesInput - The input type for the suggestResources function.
 * - SuggestResourcesOutput - The return type for the suggestResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { extractJsonFromResponse } from './flow_utils';

const SuggestResourcesInputSchema = z.object({
  courseContent: z
    .string()
    .describe('The course content to suggest resources for.'),
});
export type SuggestResourcesInput = z.infer<typeof SuggestResourcesInputSchema>;

const SuggestedResourceSchema = z.object({
  title: z.string().describe('The title of the suggested resource.'),
  url: z.string().url().describe('The URL of the suggested resource.'),
  reason: z.string().describe('Why this resource is relevant to the course content.'),
});

const SuggestResourcesOutputSchema = z.array(SuggestedResourceSchema).describe('An array of suggested resources.');
export type SuggestResourcesOutput = z.infer<typeof SuggestResourcesOutputSchema>;

export async function suggestResources(input: SuggestResourcesInput, userId: string, sessionId: string): Promise<SuggestResourcesOutput> {
  // Use ADK /run endpoint with configurable backend URL
  const ADK_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";
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
            text: `Suggest 3-5 relevant references for this content. For each resource, provide a title, URL, and a brief reason why it's relevant. Format your response as a JSON array of objects with 'title' (string), 'url' (string, must be a valid URL), and 'reason' (string) fields. Here's the content: ${input.courseContent}\n\nFormat your response like this: [{\"title\": \"...\", \"url\": \"https://...\", \"reason\": \"...\"}]`
          }]
        }
      })
    });

    if (!res.ok) throw new Error(`Failed to generate flashcards from backend agent: ${res.status}`);

    const output = (await res.json())[0]?.content?.parts?.[0]?.text;
    const data = await extractJsonFromResponse(output);

    let result;
    try {
      result = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      result = data;
    }
    // Ensure the response matches our expected schema
    if (!SuggestResourcesOutputSchema.safeParse(result).success) {
      throw new Error("Failed to parse response as SuggestResourcesOutput");
    }
    return result;
  } catch (error) {
    console.error("Error in API call, falling back to local flow:", error);
    try {
      // Fall back to the local implementation if the API call fails
      return await suggestResourcesFlow(input);
    } catch (fallbackError) {
      console.error("Error in fallback implementation:", fallbackError);
      throw fallbackError;
    }
  }
}

const resourceSuggestionTool = ai.defineTool({
  name: 'getSuggestedResource',
  description: 'Returns a single suggested resource based on the course content.  The URL must be open-access and non-copyrighted.',
  inputSchema: z.object({
    courseContent: z.string().describe('The course content to suggest a resource for.'),
  }),
  outputSchema: SuggestedResourceSchema,
},
async (input) => {
  console.log(`Finding suggested resource based on course content: ${input.courseContent}`);
  // In a real application, this would call an external API or database to find relevant resources.
  // This is just a placeholder implementation.
  return {
    title: 'Example Resource',
    url: 'https://example.com',
    reason: 'This is a placeholder resource.',
  };
});

const prompt = ai.definePrompt({
  name: 'suggestResourcesPrompt',
  input: {
    schema: SuggestResourcesInputSchema,
  },
  output: {
    schema: SuggestResourcesOutputSchema,
  },
  tools: [resourceSuggestionTool],
  prompt: `You are an AI assistant that suggests relevant study materials and videos for a given course content.

  Suggest three relevant resources based on the course content. Use the getSuggestedResource tool to find relevant resources.  The URL must be open-access and non-copyrighted.  Explain why the resource is relevant to the course content.

  Course Content: {{{courseContent}}}`,
});

const suggestResourcesFlow = ai.defineFlow(
  {
    name: 'suggestResourcesFlow',
    inputSchema: SuggestResourcesInputSchema,
    outputSchema: SuggestResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
