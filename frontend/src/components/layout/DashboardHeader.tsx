'use client';

import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { DashboardSidebar } from './DashboardSidebar'; // For mobile nav content

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="md:hidden"> {/* Mobile navigation trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 bg-sidebar text-sidebar-foreground">
            {/* Re-using DashboardSidebar logic/structure for mobile, but simplified for SheetContent */}
             <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <AppLogo />
              </div>
              {/* You might want a slightly different nav structure for mobile or pass props to DashboardSidebar to adjust */}
              <DashboardSidebar /> 
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/* Optional: Search bar or other header elements */}
        {/* <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form> */}
        <UserNav />
      </div>
    </header>
  );
}
