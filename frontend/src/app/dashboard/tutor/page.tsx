import { AiTutorChat } from '@/components/dashboard/AiTutorChat';

export default function TutorPage() {
  return (
    // The AiTutorChat component is designed to take up vertical space.
    // Ensure its parent container allows it to expand.
    // The dashboard layout should provide enough vertical space.
    <div className="container mx-auto h-full"> 
      <AiTutorChat />
    </div>
  );
}
