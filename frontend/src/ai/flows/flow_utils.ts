export async function extractJsonFromResponse(response: string): Promise<any> {
    const match = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error('Failed to parse JSON from response:', e);
            return null;
        }
    }
    return null;
}