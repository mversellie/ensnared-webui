import { useState, useEffect } from "react";
import { Post } from "./Post";

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Alex Chen",
      username: "@alexchen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    content: "Just finished building an amazing React component! The feeling when everything clicks together is incredible. 🚀",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3
  },
  {
    id: "2",
    author: {
      name: "Sarah Johnson",
      username: "@sarahj",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c0?w=150&h=150&fit=crop&crop=face"
    },
    content: "Beautiful sunset from my evening walk. Sometimes you need to step away from the screen and enjoy nature.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    timestamp: "4 hours ago",
    likes: 156,
    comments: 23,
    shares: 12
  },
  {
    id: "3",
    author: {
      name: "Mike Rodriguez",
      username: "@mikr",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    content: "Working on a new design system. The attention to detail in modern UI frameworks is incredible. What's your favorite design tool?",
    timestamp: "6 hours ago",
    likes: 89,
    comments: 15,
    shares: 7
  },
  {
    id: "4",
    author: {
      name: "Emily Davis",
      username: "@emilyd",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    content: "Coffee shop vibes and coding session. There's something magical about the combination of good coffee and creative flow.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    timestamp: "8 hours ago",
    likes: 67,
    comments: 12,
    shares: 5
  }
];

export const Feed = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
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
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};