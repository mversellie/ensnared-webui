import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Post } from "./Post";
import { postService } from "@/services";
import { apiRequest } from "@/services/api";
import { PostDTO, PostListResponse } from "@/types/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Feed = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['feed', userId],
    queryFn: () => userId ? postService.getFeed(userId) : postService.getPosts(),
  });

  const handleRandomPost = async () => {
    setIsGenerating(true);
    try {
      const newPost = await apiRequest<PostDTO>('/random_behavior/random_post');
      queryClient.setQueryData(['feed', userId], (oldData: PostListResponse | undefined) => ({
        posts: [newPost, ...(oldData?.posts || [])],
      }));
    } catch (err) {
      console.error('Failed to generate random post:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sort posts by date descending
  const posts: PostDTO[] = postsData?.posts?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  if (isLoading) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleRandomPost} disabled={isGenerating}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Random Post'}
        </Button>
      </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-soft animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Posts</AlertTitle>
          <AlertDescription>
            Failed to load posts. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No Posts Yet</h2>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Post key={post.id} post={post} />
        ))
      )}
    </div>
  );
};