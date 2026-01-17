import { useState, useEffect } from "react";
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
import { apiRequest } from "@/services/api";

const contentSchema = z.object({
  writersNote: z.string().optional(),
  worldSettings: z.string().trim().min(1, { message: "World Settings is required" }),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface PromptTemplate {
  templateName: string;
  template: string;
}

const DEFAULT_WRITERS_NOTE = `The story takes place in a medieval fantasy setting. Characters should speak formally and reference magic as commonplace. Maintain a tone of wonder and adventure throughout all interactions.`;

const DEFAULT_WORLD_SETTINGS = `A magical realm where dragons soar through crystal skies and ancient wizards study in towering spires. The land is filled with mystical creatures, enchanted forests, and powerful artifacts waiting to be discovered. Technology is minimal, replaced instead by arcane innovations and elemental manipulation.`;

export const ContentSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiWritersNote, setHasApiWritersNote] = useState(false);
  const [hasApiWorldSettings, setHasApiWorldSettings] = useState(false);
  const [originalWritersNote, setOriginalWritersNote] = useState("");
  const [originalWorldSettings, setOriginalWorldSettings] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      writersNote: "",
      worldSettings: "",
    },
  });

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await apiRequest<any>("/configuration/prompts/batch_get", {
          method: "POST",
          body: JSON.stringify({ templateNames: ["world", "authors_note"] }),
        });

        console.log("Prompts response:", response);

        // Handle both array and object with templates property

        const authorsNote = response["authors_note"];
        const worldPrompts = response["world"];

        setHasApiWritersNote(!!authorsNote);
        setHasApiWorldSettings(!!worldPrompts);
        setOriginalWritersNote(authorsNote || "");
        setOriginalWorldSettings(worldPrompts || "");

        reset({
          writersNote: authorsNote || localStorage.getItem("setup_writersNote") || "",
          worldSettings: worldPrompts || localStorage.getItem("setup_worldSettings") || "",
        });
      } catch (error) {
        console.error("Failed to fetch prompts:", error);
        // Fall back to localStorage
        reset({
          writersNote: localStorage.getItem("setup_writersNote") || "",
          worldSettings: localStorage.getItem("setup_worldSettings") || "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [reset]);

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true);

    try {
      // Save changed prompts to API
      const savePromises: Promise<any>[] = [];

      if (data.writersNote !== originalWritersNote) {
        savePromises.push(
          apiRequest("/configuration/prompts", {
            method: "POST",
            body: JSON.stringify({ name: "authors_note", content: data.writersNote || "" }),
          })
        );
      }

      if (data.worldSettings !== originalWorldSettings) {
        savePromises.push(
          apiRequest("/configuration/prompts", {
            method: "POST",
            body: JSON.stringify({ name: "world", content: data.worldSettings || "" }),
          })
        );
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      // Update setup status
      await settingsService.saveSettings({ setupStatus: "World Data Configured" });

      // Save content data to localStorage
      localStorage.setItem("setup_writersNote", data.writersNote || "");
      localStorage.setItem("setup_worldSettings", data.worldSettings || "");

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
          <p className="text-muted-foreground">Step 3 of 5: AI and World Settings</p>
          <p className="text-sm text-muted-foreground mt-2">Both fields are optional, but recommended.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Writers Note */}
            <div className="space-y-2">
              <Label htmlFor="writersNote">Writers Note</Label>
              <p className="text-xs text-muted-foreground mb-2">
                A writers note provides context and instructions to the LLM about the setting, tone, style, and any
                special considerations for generating content. It helps guide the AI to produce more consistent and
                appropriate responses for your world.
              </p>
              <Textarea
                id="writersNote"
                placeholder={DEFAULT_WRITERS_NOTE}
                className={`min-h-[100px] ${hasApiWritersNote ? "border-green-500 bg-green-500/10" : ""}`}
                {...register("writersNote")}
              />
              {errors.writersNote && <p className="text-sm text-destructive">{errors.writersNote.message}</p>}
            </div>

            {/* World Settings */}
            <div className="space-y-2">
              <Label htmlFor="worldSettings">World Settings</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Describe the world or environment for your network. This sets the context and atmosphere for
                interactions.
              </p>
              <Textarea
                id="worldSettings"
                placeholder={DEFAULT_WORLD_SETTINGS}
                className={`min-h-[120px] ${hasApiWorldSettings ? "border-green-500 bg-green-500/10" : ""}`}
                {...register("worldSettings")}
              />
              {errors.worldSettings && <p className="text-sm text-destructive">{errors.worldSettings.message}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/setup/endpoints")}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
