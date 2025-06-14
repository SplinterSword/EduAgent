import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export function AppLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-primary-foreground hover:text-primary-foreground/80">
      <BookOpenCheck className={`transition-all duration-300 ${collapsed ? 'h-7 w-7' : 'h-6 w-6'}`} />
      {!collapsed && <span className="font-headline text-xl font-semibold">EduAssistant</span>}
    </Link>
  );
}
