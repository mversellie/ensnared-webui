import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface PostData {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

interface PostProps {
  post: PostData;
}

export const Post = ({ post }: PostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card className="bg-card border-border shadow-soft hover:shadow-medium transition-smooth">
      <CardContent className="p-6">
        {/* Author header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground">{post.author.username} • {post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={18} />
          </Button>
        </div>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-card-foreground leading-relaxed">{post.content}</p>
        </div>

        {/* Post image */}
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Engagement actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 transition-smooth ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground transition-smooth">
              <MessageCircle size={18} />
              <span>{post.comments}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground transition-smooth">
              <Share size={18} />
              <span>{post.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};