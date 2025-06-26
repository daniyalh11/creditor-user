import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";

export function ChatMessagesList({ messages, currentUserId }) {
  const scrollAreaRef = useRef(null);

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

export default ChatMessagesList;