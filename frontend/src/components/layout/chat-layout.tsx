// components/layout/chat-layout.tsx
import { ReactNode } from 'react';
import { ChatHistoryManager } from '@/components/chat/chat-history-manager';

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:block w-64">
        <ChatHistoryManager />
      </div>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}


