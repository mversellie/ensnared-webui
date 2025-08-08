import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contentSchema = z.object({
  systemPrompt: z.string().min(1, "System prompt is required"),
  worldSettings: z.string().min(1, "World settings are required"),
});

type ContentFormData = z.infer<typeof contentSchema>;

export const ContentSetup = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      systemPrompt: localStorage.getItem('setup_systemPrompt') || '',
      worldSettings: localStorage.getItem('setup_worldSettings') || '',
    },
  });

  const onSubmit = (data: ContentFormData) => {
    console.log("Content data:", data);
    // Save to localStorage
    localStorage.setItem('setup_systemPrompt', data.systemPrompt);
    localStorage.setItem('setup_worldSettings', data.worldSettings);
    
    // Clear all setup data after completion
    localStorage.removeItem('setup_networkTitle');
    localStorage.removeItem('setup_backendApiUrl');
    localStorage.removeItem('setup_messengerUrl');
    localStorage.removeItem('setup_openaiApiUrl');
    localStorage.removeItem('setup_apiToken');
    localStorage.removeItem('setup_systemPrompt');
    localStorage.removeItem('setup_worldSettings');
    
    navigate("/");
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
            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <p className="text-xs text-muted-foreground mb-2">
                A system prompt defines the behavior and personality of the AI. It tells the LLM how to respond, what role to play, and what guidelines to follow in conversations.
              </p>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful assistant that..."
                className="min-h-[100px]"
                {...register("systemPrompt")}
              />
              {errors.systemPrompt && (
                <p className="text-sm text-destructive">{errors.systemPrompt.message}</p>
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
              <Button type="submit" className="flex-1">
                Complete Setup
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSetup;