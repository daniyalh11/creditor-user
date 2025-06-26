import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoiceMessage } from "@/components/messages/VoiceMessage";

export function ChatMessage({ message, currentUserId }) {
  const isUser = message.senderId === currentUserId;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100">
        <AvatarImage src={message.senderAvatar} />
        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-semibold">
          {message.senderName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col min-w-0 max-w-[65%] ${
        isUser ? "items-end" : "items-start"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-600">
            {message.senderName}
          </span>
          <span className="text-xs text-gray-400">
            {message.timestamp}
          </span>
        </div>
        
        {message.type === 'voice' && message.audioBlob && message.duration ? (
          <VoiceMessage 
            audioBlob={message.audioBlob}
            duration={message.duration}
            isUser={isUser}
          />
        ) : (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm break-words word-wrap overflow-wrap-anywhere max-w-full ${
              isUser
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;