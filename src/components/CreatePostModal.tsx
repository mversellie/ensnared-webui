import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Smile } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Simulate post creation
    toast({
      title: "Post created!",
      description: "Your post has been shared successfully.",
    });

    // Reset form and close modal
    setContent("");
    setImageUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Add an image (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Image size={18} />
              </Button>
            </div>
          </div>
          
          {imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={imageUrl} 
                alt="Post preview" 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm">
                <Smile size={18} />
                <span className="ml-2">Emoji</span>
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!content.trim()}>
                Post
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};