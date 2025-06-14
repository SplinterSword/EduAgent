'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateFlashcards, type GenerateFlashcardsInput, type GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import type { Flashcard as FlashcardType } from '@/types';
import { Loader2, Copy, RotateCcw, Check, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function Flashcard({ card, isFlipped, onFlip }: { card: FlashcardType; isFlipped: boolean; onFlip: () => void; }) {
  return (
    <motion.div
      className="relative h-64 w-full cursor-pointer rounded-lg shadow-lg perspective"
      onClick={onFlip}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center backface-hidden"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg font-semibold">{card.front}</p>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border bg-primary p-6 text-center text-primary-foreground backface-hidden"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isFlipped ? 0 : -180 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg">{card.back}</p>
      </motion.div>
    </motion.div>
  );
}

export function FlashcardGenerator() {
  const [courseMaterial, setCourseMaterial] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const { toast } = useToast();

  const handleGenerateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseMaterial.trim()) {
      toast({ title: 'Empty Material', description: 'Please paste your course material.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setFlashcards([]);
    setCurrentCardIndex(0);
    try {
      const input: GenerateFlashcardsInput = { courseMaterial };
      const result: GenerateFlashcardsOutput = await generateFlashcards(input);
      const newFlashcards = result.flashcards.map((fc, index) => ({ ...fc, id: `fc-${index}-${Date.now()}` }));
      setFlashcards(newFlashcards);
      setFlippedStates(new Array(newFlashcards.length).fill(false));
      if (newFlashcards.length === 0) {
        toast({ title: 'No Flashcards Generated', description: 'Could not generate flashcards from the provided material. Try different content.', variant: 'default' });
      } else {
         toast({ title: 'Flashcards Generated!', description: `Successfully generated ${newFlashcards.length} flashcards.`, variant: 'default' });
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({ title: 'Error', description: 'Failed to generate flashcards. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleFlip = (index: number) => {
    setFlippedStates(prev => prev.map((state, i) => (i === index ? !state : state)));
  };

  const nextCard = () => setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
  const prevCard = () => setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);

  return (
    <div className="space-y-8">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 bg-primary/10 rounded-lg text-primary">
              <Copy className="h-8 w-8" />
            </span>
            <div>
              <CardTitle className="font-headline text-2xl">Flashcard Generator</CardTitle>
              <CardDescription>Paste your course material to create interactive flashcards.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleGenerateFlashcards}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="flashcardMaterial" className="text-lg font-medium flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Course Material for Flashcards
              </Label>
              <Textarea
                id="flashcardMaterial"
                value={courseMaterial}
                onChange={(e) => setCourseMaterial(e.target.value)}
                placeholder="Paste text content here..."
                rows={8}
                className="text-base"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</> : 'Generate Flashcards'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                Review Your Flashcards
            </CardTitle>
            <CardDescription>
              Displaying card {currentCardIndex + 1} of {flashcards.length}. Click card to flip.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-full max-w-xl h-64 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={flashcards[currentCardIndex].id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Flashcard 
                    card={flashcards[currentCardIndex]} 
                    isFlipped={flippedStates[currentCardIndex]}
                    onFlip={() => handleFlip(currentCardIndex)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex w-full max-w-xl justify-between items-center">
              <Button onClick={prevCard} variant="outline" disabled={flashcards.length <= 1}>Previous</Button>
              <span className="text-muted-foreground text-sm">Card {currentCardIndex + 1} / {flashcards.length}</span>
              <Button onClick={nextCard} variant="outline" disabled={flashcards.length <= 1}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading && flashcards.length === 0 && (
         <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Generating flashcards, please wait...</p>
          </div>
      )}
    </div>
  );
}

// Add perspective and backface-visibility to your globals.css or a style tag if not using Tailwind for it
// For Tailwind, you might need a plugin or utility classes:
// .perspective { perspective: 1000px; }
// .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
// Add these to your globals.css if not present
// @layer utilities {
//   .perspective { perspective: 1000px; }
//   .backface-hidden { backface-visibility: hidden; }
// }
// Ensure globals.css has these utilities:
// @layer utilities {
//   .perspective {
//     perspective: 1000px;
//   }
//   .preserve-3d {
//     transform-style: preserve-3d;
//   }
//   .backface-hidden {
//     backface-visibility: hidden;
//   }
// }
// The card itself would need preserve-3d if children are transformed in 3D space relative to it.
// For this direct child rotation, it might not be strictly necessary on the parent.
// The above component structure is simplified for direct rotation of front/back faces.
