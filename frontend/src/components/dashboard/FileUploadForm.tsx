'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// This component simulates file upload by using a textarea for course material.
// A proper file upload to a local backend requires a dedicated server setup,
// which is outside the scope of typical Next.js serverless deployments.
// The AI flows expect text input, so this aligns with their current structure.

export function FileUploadForm({
  onMaterialSubmit,
  title,
  description,
  submitButtonText = "Process Material",
  isLoading,
}: {
  onMaterialSubmit: (material: string) => Promise<void>;
  title: string;
  description: string;
  submitButtonText?: string;
  isLoading: boolean;
}) {
  const [courseMaterial, setCourseMaterial] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseMaterial.trim()) {
      toast({
        title: 'Empty Material',
        description: 'Please paste your course material.',
        variant: 'destructive',
      });
      return;
    }
    await onMaterialSubmit(courseMaterial);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <span className="p-3 bg-primary/10 rounded-lg text-primary">
            <UploadCloud className="h-8 w-8" />
          </span>
          <div>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="courseMaterial" className="text-lg font-medium flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Paste Course Material Here
            </Label>
            <Textarea
              id="courseMaterial"
              value={courseMaterial}
              onChange={(e) => setCourseMaterial(e.target.value)}
              placeholder="Paste your course content (e.g., text from PDF, DOCX)..."
              rows={15}
              className="text-base"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: For this prototype, please copy and paste text content from your files.
              Direct file parsing will be supported in future versions.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
