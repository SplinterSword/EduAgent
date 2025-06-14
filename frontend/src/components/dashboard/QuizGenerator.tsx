'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQuizzes, type GenerateQuizzesInput, type GenerateQuizzesOutput } from '@/ai/flows/generate-quizzes';
import type { QuizQuestion } from '@/types';
import { Loader2, HelpCircle, CheckCircle, XCircle, FileText, ThumbsUp, MessageCircleQuestion } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function QuizGenerator() {
  const [courseMaterial, setCourseMaterial] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseMaterial.trim()) {
      toast({ title: 'Empty Material', description: 'Please paste course material.', variant: 'destructive' });
      return;
    }
    if (numQuestions <= 0) {
      toast({ title: 'Invalid Number', description: 'Number of questions must be positive.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setQuiz([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setScore(0);

    try {
      const input: GenerateQuizzesInput = { courseMaterial, numQuestions };
      const result: GenerateQuizzesOutput = await generateQuizzes(input);
      const newQuiz = result.quiz.map((q, index) => ({ ...q, id: `q-${index}-${Date.now()}` }));
      setQuiz(newQuiz);
       if (newQuiz.length === 0) {
        toast({ title: 'No Quiz Generated', description: 'Could not generate a quiz. Try different material or settings.', variant: 'default' });
      } else {
        toast({ title: 'Quiz Generated!', description: `Successfully generated a ${newQuiz.length}-question quiz.`, variant: 'default' });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({ title: 'Error', description: 'Failed to generate quiz.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    const updatedQuiz = quiz.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctAnswers++;
      return { ...q, userAnswer, isCorrect };
    });
    setQuiz(updatedQuiz);
    setScore(correctAnswers);
    setQuizSubmitted(true);
    toast({
      title: 'Quiz Submitted!',
      description: `You scored ${correctAnswers} out of ${quiz.length}.`,
      variant: correctAnswers / quiz.length >= 0.7 ? 'default' : 'destructive',
    });
  };
  
  const progress = quiz.length > 0 ? ((currentQuestionIndex + 1) / quiz.length) * 100 : 0;

  if (isLoading && quiz.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Generating your quiz, please wait...</p>
      </div>
    );
  }

  if (quiz.length > 0 && !quizSubmitted) {
    const currentQuestion = quiz[currentQuestionIndex];
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
             <MessageCircleQuestion className="h-8 w-8 text-primary" />
            Quiz Time!
          </CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {quiz.length}</CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="rounded-md border bg-secondary/30 p-4">
            <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${i}`} />
                  <Label htmlFor={`${currentQuestion.id}-option-${i}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          {currentQuestionIndex === quiz.length - 1 ? (
            <Button onClick={handleSubmitQuiz} className="bg-green-500 hover:bg-green-600 text-white">Submit Quiz</Button>
          ) : (
            <Button variant="default" onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.length - 1, prev + 1))} disabled={!answers[currentQuestion.id]}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (quizSubmitted) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center">
           <ThumbsUp className="mx-auto h-12 w-12 text-green-500 mb-2" />
          <CardTitle className="font-headline text-3xl">Quiz Completed!</CardTitle>
          <CardDescription className="text-lg">You scored: {score} / {quiz.length} ({((score / quiz.length) * 100).toFixed(0)}%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.map((q, index) => (
            <div key={q.id} className={cn("rounded-md border p-4", q.isCorrect ? "border-green-500 bg-green-500/10" : "border-destructive bg-destructive/10")}>
              <p className="font-semibold mb-1">Q{index + 1}: {q.question}</p>
              <p className="text-sm">Your answer: <span className={cn(q.isCorrect ? "text-green-700" : "text-red-700")}>{q.userAnswer || "Not answered"}</span>
                {q.isCorrect ? <CheckCircle className="inline ml-1 h-4 w-4 text-green-700" /> : <XCircle className="inline ml-1 h-4 w-4 text-red-700" />}
              </p>
              {!q.isCorrect && <p className="text-sm text-muted-foreground">Correct answer: {q.correctAnswer}</p>}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={() => { setQuiz([]); setQuizSubmitted(false); }} className="w-full">Take Another Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
     <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 bg-primary/10 rounded-lg text-primary">
              <HelpCircle className="h-8 w-8" />
            </span>
            <div>
              <CardTitle className="font-headline text-2xl">Quiz Generator</CardTitle>
              <CardDescription>Create a quiz from your course material.</CardDescription>
            </div>
          </div>
        </CardHeader>
      <form onSubmit={handleGenerateQuiz}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="quizMaterial" className="text-lg font-medium flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Course Material for Quiz
            </Label>
            <Textarea
              id="quizMaterial"
              value={courseMaterial}
              onChange={(e) => setCourseMaterial(e.target.value)}
              placeholder="Paste text content here..."
              rows={8}
              className="text-base"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="numQuestions" className="text-lg font-medium mb-2 block">Number of Questions</Label>
            <Input
              id="numQuestions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
              min="1"
              max="20"
              className="w-full md:w-1/2 lg:w-1/3 text-base"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Quiz...</> : 'Generate Quiz'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
