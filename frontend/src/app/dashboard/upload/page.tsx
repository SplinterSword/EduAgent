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
        onMaterialSubmit={handleMaterialSubmit}
        title="Upload Course Material"
        description="Paste your course text here to make it available for AI processing like flashcards, quizzes, and tutoring."
        submitButtonText="Submit Material for AI"
        isLoading={isLoading}
      />
       <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground mb-2">How to Use:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Copy text content from your PDF, DOCX, or other course files.</li>
          <li>Paste the copied text into the text area above.</li>
          <li>Click &quot;Submit Material for AI&quot;.</li>
          <li>Once submitted (simulated for now), this material could be used by other features on this platform.</li>
          <li>Currently, each AI feature (Flashcards, Quizzes, Tutor) will require you to paste material directly on its page.</li>
        </ul>
      </div>
    </div>
  );
}
