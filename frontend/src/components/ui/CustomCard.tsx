import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface CustomCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  button?: ReactNode; // Optional button for the header
}

export function CustomCard({ title, description, icon: Icon, children, className, button }: CustomCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-md text-primary">
                <Icon className="h-6 w-6" />
            </span>
            <div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            </div>
            {button && <div>{button}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
