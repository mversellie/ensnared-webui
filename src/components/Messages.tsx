import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messageService, userService } from "@/services";
import { useToast } from "@/components/ui/use-toast";

export const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, using a hardcoded current user ID
  const currentUserId = "demo-user-1";

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });

  const { data: sentMessages } = useQuery({
    queryKey: ['sent-messages', currentUserId],
    queryFn: () => messageService.getSentMessages(currentUserId),
    enabled: !!currentUserId,
  });

  const { data: receivedMessages } = useQuery({
    queryKey: ['received-messages', currentUserId],
    queryFn: () => messageService.getReceivedMessages(currentUserId),
    enabled: !!currentUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: messageService.sendDirectMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['received-messages'] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Combine and organize conversations
  const conversations = usersData?.users?.filter(user => user.id !== currentUserId) || [];
  const selectedUser = conversations.find(user => user.id === selectedUserId);

  // Get messages for selected conversation
  const allMessages = [
    ...(sentMessages?.messages || []).map(msg => ({ ...msg, sender: 'me' as const })),
    ...(receivedMessages?.messages || []).map(msg => ({ ...msg, sender: 'other' as const }))
  ];

  const conversationMessages = selectedUserId 
    ? allMessages.filter(msg => 
        msg.sender_id === selectedUserId || msg.receiver_id === selectedUserId
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      sender_id: currentUserId,
      receiver_id: selectedUserId,
    });
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
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  conversations.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50 ${
                        selectedUserId === user.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{user.username}</h4>
                            <span className="text-xs text-muted-foreground">Online</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">Start a conversation</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
            {selectedUser ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} alt={selectedUser.username} />
                    <AvatarFallback>{selectedUser.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedUser.username}</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
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
              </>
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="font-medium">Select a conversation</h3>
              </div>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {selectedUser ? (
                conversationMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  conversationMessages.map((message) => (
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
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select a user to start messaging</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder={selectedUser ? "Type a message..." : "Select a user first"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={!selectedUser || sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!selectedUser || !newMessage.trim() || sendMessageMutation.isPending}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};