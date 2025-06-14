'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/layout/AppLogo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  UploadCloud,
  Copy,
  HelpCircle,
  MessageSquareText,
  BookMarked,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/upload', label: 'Upload Material', icon: UploadCloud },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: Copy },
  { href: '/dashboard/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/dashboard/resources', label: 'Resources', icon: BookMarked },
  { href: '/dashboard/tutor', label: 'AI Tutor', icon: MessageSquareText },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if(isMounted) { // Only run if component is mounted to avoid SSR/localStorage mismatch
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMounted]);


  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  if (!isMounted) { // Prevents FOUC and hydration errors
    return (
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out">
         <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <AppLogo />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Skeleton or placeholder content */}
        </div>
      </aside>
    );
  }


  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
         <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn("flex h-16 items-center justify-between border-b border-sidebar-border", isCollapsed ? "px-0 justify-center" : "px-4")}>
          <AppLogo collapsed={isCollapsed} />
        </div>

        <ScrollArea className="flex-1">
          <nav className={cn("flex flex-col gap-1 p-2", isCollapsed ? "items-center px-1 py-2" : "px-2 py-2")}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link href={item.href} key={item.label} legacyBehavior passHref>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 text-base',
                      isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isCollapsed ? 'h-10 w-10 justify-center p-0' : 'h-10'
                    )}
                    aria-label={item.label}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "")} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        
        <div className={cn("mt-auto border-t border-sidebar-border p-2", isCollapsed ? "flex justify-center" : "")}>
           <Button variant="ghost" onClick={toggleSidebar} className={cn("w-full justify-start gap-3 text-base", isCollapsed ? "h-10 w-10 justify-center p-0" : "h-10")}>
            {isCollapsed ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            {!isCollapsed && <span>Collapse</span>}
          </Button>
        </div>
      </aside>
      {/* Content margin pusher */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out md:ml-64',
           isMounted && isCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      />
    </>
  );
}
