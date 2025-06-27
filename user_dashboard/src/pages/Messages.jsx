import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Send, Smile } from "lucide-react";
import { useState } from "react";
import { VoiceRecorder } from "@/components/messages/VoiceRecorder";
import { VoiceMessage } from "@/components/messages/VoiceMessage";

// Dummy data - replace with real data later
const friends = [
  { id: 1, name: "Sarah Wilson", avatar: "/placeholder.svg", lastMessage: "Hey there!" },
  { id: 2, name: "Michael Chen", avatar: "/placeholder.svg", lastMessage: "Let's catch up later" },
  { id: 3, name: "Emily Brown", avatar: "/placeholder.svg", lastMessage: "Did you see the new course?" },
  { id: 4, name: "David Kim", avatar: "/placeholder.svg", lastMessage: "Thanks for your help!" },
  { id: 5, name: "Jessica Taylor", avatar: "/placeholder.svg", lastMessage: "Are you free tomorrow?" },
  { id: 6, name: "Robert Johnson", avatar: "/placeholder.svg", lastMessage: "I'll get back to you" },
];

function Messages() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, senderId: 1, text: "Hey there!", timestamp: "10:30 AM", type: 'text' },
    { id: 2, senderId: 0, text: "Hi! How are you?", timestamp: "10:31 AM", type: 'text' },
    { id: 3, senderId: 1, text: "I'm doing great! Just finished the React module.", timestamp: "10:33 AM", type: 'text' },
    { id: 4, senderId: 0, text: "That's awesome! I'm still working on it.", timestamp: "10:34 AM", type: 'text' },
    { id: 5, senderId: 1, text: "Let me know if you need any help with it.", timestamp: "10:36 AM", type: 'text' },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          senderId: 0,
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'text',
        },
      ]);
      setNewMessage("");
    }
  };

  const handleSendVoiceMessage = (audioBlob, duration) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: 0,
        audioBlob,
        audioDuration: duration,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'voice',
      },
    ]);
    setShowVoiceRecorder(false);
  };

  const handleEmojiClick = () => {
    console.log("Emoji picker clicked");
    // Add emoji picker functionality here
  };

  const handleMicClick = () => {
    setShowVoiceRecorder(true);
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-6">
      <div className="rounded-lg border bg-card shadow-sm mb-8">
        <div className="flex h-[700px]">
          {/* Friends List Sidebar */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={`p-4 flex items-center gap-3 hover:bg-accent cursor-pointer transition-colors border-b ${
                    selectedFriend === friend.id ? "bg-accent" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">12:30 PM</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {friend.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          friends.find((f) => f.id === selectedFriend)?.avatar
                        }
                      />
                      <AvatarFallback>
                        {friends.find((f) => f.id === selectedFriend)?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {friends.find((f) => f.id === selectedFriend)?.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === 0 ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.senderId !== 0 && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage
                              src={friends.find((f) => f.id === selectedFriend)?.avatar}
                            />
                            <AvatarFallback>
                              {friends.find((f) => f.id === selectedFriend)?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {message.type === 'voice' && message.audioBlob ? (
                          <div className="max-w-[70%]">
                            <VoiceMessage 
                              audioBlob={message.audioBlob} 
                              duration={message.audioDuration || 0}
                              isUser={message.senderId === 0}
                            />
                            <p className="text-xs mt-1 opacity-70 text-right">
                              {message.timestamp}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className="text-xs mt-1 opacity-70 text-right">
                              {message.timestamp}
                            </p>
                          </div>
                        )}
                        
                        {message.senderId === 0 && (
                          <Avatar className="h-8 w-8 ml-2 mt-1">
                            <AvatarFallback>Y</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  {showVoiceRecorder ? (
                    <VoiceRecorder 
                      onSendVoiceMessage={handleSendVoiceMessage}
                      onCancel={() => setShowVoiceRecorder(false)}
                    />
                  ) : (
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground z-10"
                          onClick={handleEmojiClick}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                          className="rounded-full pl-12 pr-4 h-12 text-base bg-gray-100 border-gray-200 focus:bg-white"
                        />
                      </div>
                      <VoiceRecorder 
                        onSendVoiceMessage={handleSendVoiceMessage}
                        onCancel={() => setShowVoiceRecorder(false)}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className={`rounded-full h-12 w-12 transition-all ${
                          newMessage.trim() 
                            ? "bg-purple-500 hover:bg-purple-600 text-white" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        size="icon"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
                <MessageCircle className="h-12 w-12" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;