import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { settingsService } from "@/services";
import { ChipInput } from "@/components/ui/chip-input";

const conceptsSchema = z.object({
  concepts: z.array(z.string()).optional().default([]),
});

type ConceptsFormData = z.infer<typeof conceptsSchema>;

export const ConceptsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConceptsFormData>({
    resolver: zodResolver(conceptsSchema),
    defaultValues: {
      concepts: JSON.parse(localStorage.getItem('setup_concepts') || '[]'),
    },
  });

  const onSubmit = async (data: ConceptsFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save concepts to localStorage
      localStorage.setItem('setup_concepts', JSON.stringify(data.concepts));

      // Collect all setup data from localStorage
      const setupData = {
        networkTitle: localStorage.getItem('setup_networkTitle') || '',
        backendApiUrl: localStorage.getItem('setup_backendApiUrl') || '',
        messengerUrl: localStorage.getItem('setup_messengerUrl') || '',
        openaiApiUrl: localStorage.getItem('setup_openaiApiUrl') || '',
        apiToken: localStorage.getItem('setup_apiToken') || '',
        writersNote: localStorage.getItem('setup_writersNote') || '',
        worldSettings: localStorage.getItem('setup_worldSettings') || '',
        concepts: data.concepts,
      };

      console.log("Sending setup data:", setupData);

      // Send to /settings endpoint using settingsService
      const result = await settingsService.saveSettings(setupData);
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
      localStorage.removeItem('setup_concepts');

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
            Define Concepts
          </CardTitle>
          <p className="text-muted-foreground">
            Step 4 of 4: Key Terms and Concepts
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Concepts */}
            <div className="space-y-2">
              <Label htmlFor="concepts">Key Concepts</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Enter important terms, concepts, or keywords that define your network's domain. These help the AI understand your context better.
              </p>
              <Controller
                name="concepts"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <ChipInput
                    value={value || []}
                    onChange={onChange}
                    placeholder="e.g., artificial intelligence, machine learning, neural networks..."
                  />
                )}
              />
              {errors.concepts && (
                <p className="text-sm text-destructive">{errors.concepts.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/setup/content")}
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

export default ConceptsSetup;