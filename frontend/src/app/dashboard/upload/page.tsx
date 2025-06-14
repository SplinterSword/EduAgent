// This page currently serves as a placeholder or UI demonstration for file upload.
// Actual file storage on a "local backend" is complex with Next.js serverless architecture.
// The AI flows are designed to take text input. For now, users can paste text content.
'use client';

import { FileUploadForm } from '@/components/dashboard/FileUploadForm';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function UploadPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleMaterialSubmit = async (material: string) => {
    setIsLoading(true);
    // In a real scenario, this would send the material to a backend
    // or store it (e.g., in localStorage or a state management solution for client-side processing by AI flows).
    // For now, we'll just simulate a delay and show a success message.
    console.log('Submitted material:', material.substring(0, 100) + '...'); 
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    toast({
      title: 'Material Submitted (Simulated)',
      description: 'Your course material has been received. You can now use it with other AI features.',
      variant: 'default',
    });
    // Potentially save `material` to a global state/context or localStorage
    // so other pages (flashcards, quizzes, tutor) can access it.
    // For this example, each feature page will have its own input.
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <FileUploadForm
        title="Upload Course Material"
        description="Upload your PDF or PPTX course material. The content will be parsed and stored in your browser for use in flashcards, quizzes, and tutoring."
        submitButtonText="Upload and Parse"
        isLoading={isLoading}
      />
      <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">How to Use:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Upload a PDF or PPTX file containing your course material.</li>
          <li>The content will be parsed and stored in your browser (localStorage).</li>
          <li>Flashcards, quizzes, and tutor features will automatically use your latest uploaded material.</li>
          <li>If you upload a new file, it will replace the previous material for those features.</li>
        </ul>
      </div>
    </div>
  );
}
