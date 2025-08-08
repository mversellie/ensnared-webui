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

const contentSchema = z.object({
  writersNote: z.string().min(1, "Writers note is required"),
  worldSettings: z.string().min(1, "World settings are required"),
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
      // Collect all setup data from localStorage
      const setupData = {
        networkTitle: localStorage.getItem('setup_networkTitle') || '',
        backendApiUrl: localStorage.getItem('setup_backendApiUrl') || '',
        messengerUrl: localStorage.getItem('setup_messengerUrl') || '',
        openaiApiUrl: localStorage.getItem('setup_openaiApiUrl') || '',
        apiToken: localStorage.getItem('setup_apiToken') || '',
        writersNote: data.writersNote,
        worldSettings: data.worldSettings,
      };

      console.log("Sending setup data:", setupData);

      // Send to /settings endpoint
      const response = await fetch('/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Setup completed successfully:", result);

      toast({
        title: "Setup Complete",
        description: "Your configuration has been saved successfully.",
      });

      // Clear all setup data after successful submission
      localStorage.removeItem('setup_networkTitle');
      localStorage.removeItem('setup_backendApiUrl');
      localStorage.removeItem('setup_messengerUrl');
      localStorage.removeItem('setup_openaiApiUrl');
      localStorage.removeItem('setup_apiToken');
      localStorage.removeItem('setup_writersNote');
      localStorage.removeItem('setup_worldSettings');

      navigate("/");
    } catch (error) {
      console.error("Error submitting setup:", error);
      toast({
        title: "Setup Failed",
        description: "Failed to save configuration. Please try again.",
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
            Step 3 of 3: AI and World Settings
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
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSetup;