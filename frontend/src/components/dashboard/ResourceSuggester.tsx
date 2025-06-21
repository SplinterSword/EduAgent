'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { suggestResources, type SuggestResourcesInput, type SuggestResourcesOutput } from '@/ai/flows/suggest-resources';
import type { SuggestedResource } from '@/types';
import { Loader2, BookMarked, ExternalLink, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function ResourceSuggester() {
  const [courseMaterial, setCourseMaterial] = useState('');
  const [suggestedResources, setSuggestedResources] = useState<SuggestedResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Load course material from localStorage on mount
  useEffect(() => {
    try {
      const filename = localStorage.getItem('latest_course_material');
      if (!filename) {
        setMaterialError('No course material uploaded. Please upload a PDF or PPTX first.');
        setCourseMaterial('');
        return;
      }
      const content = localStorage.getItem(`course_material_${filename}`);
      if (!content) {
        setMaterialError('Stored course material not found or corrupted. Please re-upload.');
        setCourseMaterial('');
        return;
      }
      setCourseMaterial(content);
      setMaterialError(null);
    } catch (err) {
      setMaterialError('Failed to load course material.');
      setCourseMaterial('');
    }
  }, []);


  const handleSuggestResources = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseMaterial.trim()) {
      toast({ title: 'Empty Content', description: 'Please paste your course content.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setSuggestedResources([]);
    try {
      const input: SuggestResourcesInput = { courseContent: courseMaterial };
      const userId = localStorage.getItem('userID') || '';
      const sessionId = localStorage.getItem('session_id') || '';
      const result: SuggestResourcesOutput = await suggestResources(input, userId, sessionId);
      setSuggestedResources(result);
      if (result.length === 0) {
        toast({ title: 'No Resources Found', description: 'Could not find relevant resources for the provided content.', variant: 'default' });
      } else {
        toast({ title: 'Resources Suggested!', description: `Found ${result.length} relevant resources.`, variant: 'default' });
      }
    } catch (error) {
      console.error('Error suggesting resources:', error);
      toast({ title: 'Error', description: 'Failed to suggest resources. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <Card className="w-full">
       <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 bg-primary/10 rounded-lg text-primary">
              <BookMarked className="h-8 w-8" />
            </span>
            <div>
              <CardTitle className="font-headline text-2xl">Resource Suggester</CardTitle>
              <CardDescription>Get AI-powered suggestions for study materials and videos.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSuggestResources}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resourceContent" className="text-lg font-medium flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Course Content for Resource Suggestion
              </Label>
              <Textarea
                id="resourceContent"
                value={courseMaterial}
                onChange={(e) => setCourseMaterial(e.target.value)}
                placeholder="Paste course topics or specific text here..."
                rows={8}
                className="text-base"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Suggesting...</> : 'Suggest Resources'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && suggestedResources.length === 0 && (
        <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Searching for relevant resources...</p>
        </div>
      )}

      {suggestedResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Search className="h-6 w-6 text-accent"/>
                Suggested Study Resources
            </CardTitle>
            <CardDescription>Here are some resources that might be helpful for your studies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedResources.map((resource, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-primary mb-1 font-headline">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{resource.reason}</p>
                <Button variant="link" asChild className="px-0 h-auto text-accent hover:text-accent/80">
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                    Visit Resource <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
