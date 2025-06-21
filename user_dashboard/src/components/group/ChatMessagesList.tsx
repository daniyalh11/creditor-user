
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  content?: string;
  timestamp: string;
  type: 'text' | 'voice';
  audioBlob?: Blob;
  duration?: number;
}

interface ChatMessagesListProps {
  messages: ChatMessage[];
  currentUserId: number;
}

export function ChatMessagesList({ messages, currentUserId }: ChatMessagesListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full px-6 py-4">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              currentUserId={currentUserId} 
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
