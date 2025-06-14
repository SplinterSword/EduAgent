'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { aiChatTutor, type AiChatTutorInput, type AiChatTutorOutput } from '@/ai/flows/ai-chat-tutor';
import type { ChatMessage } from '@/types';
import { Loader2, MessageSquareText, User, Sparkles, Send, FileText, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function AiTutorChat() {
  const [courseMaterial, setCourseMaterial] = useState('');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Load course material from localStorage on mount
  React.useEffect(() => {
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;
    if (!courseMaterial.trim()) {
      toast({ title: 'Missing Context', description: 'Please upload course material first.', variant: 'destructive' });
      return;
    }

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const input: AiChatTutorInput = { question: userInput, courseMaterial };
      const result: AiChatTutorOutput = await aiChatTutor(input);
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error with AI Tutor:', error);
      toast({ title: 'Error', description: 'AI Tutor failed to respond. Please try again.', variant: 'destructive' });
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
      <Card className="w-full flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-3 bg-primary/10 rounded-lg text-primary">
              <MessageSquareText className="h-8 w-8" />
            </span>
            <div>
              <CardTitle className="font-headline text-2xl">AI Chat Tutor</CardTitle>
              <CardDescription>Ask questions and get help with revision. Provide course context below.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="chatCourseMaterial" className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Course Material Context
            </Label>
            <Textarea
              id="chatCourseMaterial"
              value={courseMaterial}
              onChange={(e) => setCourseMaterial(e.target.value)}
              placeholder="Paste relevant course material here for the tutor to reference..."
              rows={4}
              className="text-sm"
              disabled={isLoading && messages.length > 0} // Disable if mid-conversation
            />
          </div>
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={18}/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-xl px-4 py-3 text-sm shadow-md',
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      msg.role === 'system' && 'bg-destructive/20 text-destructive-foreground text-center w-full'
                    )}
                  >
                    <p style={{ whiteSpace: 'pre-wrap'}}>{msg.content}</p>
                    <p className={cn("text-xs mt-1", msg.role === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left')}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                   {msg.role === 'user' && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User size={18}/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && messages.length > 0 && (
                <div className="flex items-end gap-2 justify-start">
                   <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback></Avatar>
                  <div className="max-w-[70%] rounded-xl px-4 py-3 text-sm shadow-md bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 text-base"
              disabled={isLoading}
              aria-label="Your message"
            />
            <Button type="submit" size="icon" disabled={isLoading || !userInput.trim() || !courseMaterial.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
