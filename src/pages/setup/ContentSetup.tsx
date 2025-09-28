import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { settingsService } from "@/services";

const contentSchema = z.object({
  writersNote: z.string().optional(),
  worldSettings: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

export const ContentSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      writersNote: localStorage.getItem('setup_writersNote') || '',
      worldSettings: localStorage.getItem('setup_worldSettings') || '',
    },
  });

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save content data to localStorage
      localStorage.setItem('setup_writersNote', data.writersNote || '');
      localStorage.setItem('setup_worldSettings', data.worldSettings || '');

      console.log("Content data saved, proceeding to concepts step");

      toast({
        title: "Content Saved",
        description: "Moving to the final step.",
      });

      navigate("/setup/concepts");
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save content data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Content Configuration
          </CardTitle>
          <p className="text-muted-foreground">
            Step 3 of 5: AI and World Settings
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Writers Note */}
            <div className="space-y-2">
              <Label htmlFor="writersNote">Writers Note</Label>
              <p className="text-xs text-muted-foreground mb-2">
                A writers note provides context and instructions to the LLM about the setting, tone, style, and any special considerations for generating content. It helps guide the AI to produce more consistent and appropriate responses for your world.
              </p>
              <Textarea
                id="writersNote"
                placeholder="The story takes place in a medieval fantasy setting. Characters should speak formally and reference magic as commonplace..."
                className="min-h-[100px]"
                {...register("writersNote")}
              />
              {errors.writersNote && (
                <p className="text-sm text-destructive">{errors.writersNote.message}</p>
              )}
            </div>

            {/* World Settings */}
            <div className="space-y-2">
              <Label htmlFor="worldSettings">World Settings</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Describe the world or environment for your network. This sets the context and atmosphere for interactions.
              </p>
              <Textarea
                id="worldSettings"
                placeholder="A magical realm where dragons soar through crystal skies and ancient wizards study in towering spires. The land is filled with mystical creatures, enchanted forests, and powerful artifacts waiting to be discovered..."
                className="min-h-[120px]"
                {...register("worldSettings")}
              />
              {errors.worldSettings && (
                <p className="text-sm text-destructive">{errors.worldSettings.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/setup/endpoints")}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Next: Concepts" : "Next: Concepts"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSetup;