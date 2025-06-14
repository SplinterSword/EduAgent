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

export async function suggestResources(input: SuggestResourcesInput): Promise<SuggestResourcesOutput> {
  return suggestResourcesFlow(input);
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
