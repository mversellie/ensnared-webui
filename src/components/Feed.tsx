import { useQuery } from "@tanstack/react-query";
import { Post } from "./Post";
import { postService, userService } from "@/services";
import { PostDTO, UserDTO } from "@/types/api";

interface PostWithAuthor extends PostDTO {
  author?: UserDTO;
}

export const Feed = () => {
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postService.getPosts(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });

  // Transform API data to match Post component interface and sort by date descending
  const posts: PostWithAuthor[] = postsData?.posts?.map(post => {
    const author = usersData?.users?.find(user => user.id === post.user_id);
    return {
      ...post,
      author,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Posts</h2>
        <p className="text-muted-foreground">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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