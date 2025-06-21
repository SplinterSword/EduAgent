'use client';
import { Button } from '@/components/ui/button';
import { CustomCard } from '@/components/ui/CustomCard';
import { ArrowRight, BookMarked, Copy, HelpCircle, MessageSquareText, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const features = [
    {
      title: 'Upload Material',
      description: 'Upload your PDF, DOCX course files.',
      icon: UploadCloud,
      link: '/dashboard/upload',
      cta: 'Upload Files',
    },
    {
      title: 'Flashcards',
      description: 'Generate and review flashcards.',
      icon: Copy,
      link: '/dashboard/flashcards',
      cta: 'View Flashcards',
    },
    {
      title: 'Quizzes',
      description: 'Test your knowledge with AI quizzes.',
      icon: HelpCircle,
      link: '/dashboard/quizzes',
      cta: 'Take a Quiz',
    },
    {
      title: 'Suggested Resources',
      description: 'Discover relevant study materials.',
      icon: BookMarked,
      link: '/dashboard/resources',
      cta: 'Find Resources',
    },
    {
      title: 'AI Tutor',
      description: 'Chat for Q&A and revision help.',
      icon: MessageSquareText,
      link: '/dashboard/tutor',
      cta: 'Chat with Tutor',
    },
  ];

  const userID = user?.email || 'u_123';
  localStorage.setItem('userID', userID);
  const sessionId = localStorage.getItem('sessionId') || 's_' + Math.random().toString(36).substr(2, 9);
  const ADK_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000"
  const makeSession = async () => {
    const session = await fetch(`${ADK_URL}/apps/EduAssistant_Agents/users/${userID}/sessions/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: {
          key1: 'value1',
          key2: 42,
        }
      }),
    });

    if (!session.ok) {
      throw new Error('Failed to create session');
    }

    const session_id = sessionId;
    localStorage.setItem('session_id', session_id);
    console.log(session_id);
  }

  useEffect(() => {
    console.log('Dashboard Page')
    makeSession();
  }, [])
  

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 text-3xl font-bold font-headline tracking-tight text-foreground">
        Welcome to your EduAssistant Dashboard
      </h1>
      
      {/* Placeholder for Progress Tracker - would require Firestore integration */}
      <div className="mb-8 p-6 rounded-lg bg-card shadow">
        <h2 className="text-xl font-semibold font-headline mb-2">Learning Progress</h2>
        <p className="text-muted-foreground">Your progress tracking will appear here once you start interacting with flashcards and quizzes.</p>
        {/* Example progress bars - static for now */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-foreground">Flashcards Completed</span>
              <span className="text-sm font-medium text-primary">0%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-foreground">Quizzes Mastered</span>
              <span className="text-sm font-medium text-accent">0%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-accent h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <CustomCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            className="flex flex-col"
          >
            <div className="mt-auto pt-4">
              <Link href={feature.link}>
                <Button className="w-full" variant="default">
                  {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CustomCard>
        ))}
      </div>
    </div>
  );
}
