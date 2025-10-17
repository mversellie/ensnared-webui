import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PostDTO } from "@/types/api";

interface PostProps {
  post: PostDTO;
}

export const Post = ({ post }: PostProps) => {

  return (
    <Card className="bg-card border-border shadow-soft hover:shadow-medium transition-smooth">
      <CardContent className="p-6">
        {/* Author header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt={post.username} />
              <AvatarFallback>{post.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">{post.username}</h3>
              <p className="text-sm text-muted-foreground">@{post.username} • {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={18} />
          </Button>
        </div>

        {/* Post content */}
        <div>
          <p className="text-card-foreground leading-relaxed">{post.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};