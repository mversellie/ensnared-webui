import { useState } from "react";
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock conversations data
const conversations = [
  {
    id: "1",
    user: {
      name: "Alex Chen",
      username: "@alexchen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      online: true
    },
    lastMessage: "Hey! How's the new project going?",
    timestamp: "2m",
    unread: 2
  },
  {
    id: "2",
    user: {
      name: "Sarah Johnson",
      username: "@sarahj",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c0?w=150&h=150&fit=crop&crop=face",
      online: false
    },
    lastMessage: "Thanks for the help earlier!",
    timestamp: "1h",
    unread: 0
  },
  {
    id: "3",
    user: {
      name: "Mike Rodriguez",
      username: "@mikr",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      online: true
    },
    lastMessage: "Let's catch up soon 👍",
    timestamp: "3h",
    unread: 0
  }
];

// Mock messages for active chat
const mockMessages = [
  {
    id: "1",
    content: "Hey! How's the new project going?",
    sender: "other",
    timestamp: "2:34 PM"
  },
  {
    id: "2",
    content: "It's going really well! Just finished the main components.",
    sender: "me",
    timestamp: "2:35 PM"
  },
  {
    id: "3",
    content: "That's awesome! Would love to see it when you're ready.",
    sender: "other",
    timestamp: "2:36 PM"
  },
  {
    id: "4",
    content: "I'll send you a preview link later today 🚀",
    sender: "me",
    timestamp: "2:37 PM"
  }
];

export const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "me" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50 ${
                      selectedConversation.id === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.user.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conversation.user.name}</h4>
                          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">{conversation.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedConversation.user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.user.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <Video size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={18} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};