import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChipInput } from "@/components/ui/chip-input";
import { apiRequest } from "@/services/api";
import { settingsService } from "@/services";
import { Loader2 } from "lucide-react";

interface ConceptDTO {
  id: string | null;
  name: string | null;
  type: string | null;
  is_custom: boolean;
  description: string | null;
}

interface ConceptListResponse {
  concepts: ConceptDTO[];
}

const conceptsSchema = z.object({
  concepts: z.array(z.string()).optional().default([]),
});

type ConceptsFormData = z.infer<typeof conceptsSchema>;

export const ConceptsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConceptsFormData>({
    resolver: zodResolver(conceptsSchema),
    defaultValues: {
      concepts: [],
    },
  });

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        // First check if concepts already exist
        const existingResponse = await apiRequest<ConceptListResponse>('/conceptuals/all');
        
        if (existingResponse.concepts && existingResponse.concepts.length > 0) {
          // Use existing concepts
          const conceptNames = existingResponse.concepts
            .map(c => c.name)
            .filter((name): name is string => name !== null && name !== undefined);
          reset({ concepts: conceptNames });
        } else {
          // No existing concepts, generate new ones
          const response = await apiRequest<ConceptListResponse>('/conceptuals/generate');
          const conceptNames = response.concepts
            .map(c => c.name)
            .filter((name): name is string => name !== null && name !== undefined);
          reset({ concepts: conceptNames });
        }
      } catch (error) {
        console.error('Failed to fetch concepts:', error);
        toast({
          title: "Error",
          description: "Failed to load concepts. You can add them manually.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcepts();
  }, [reset, toast]);

  const onSubmit = async (data: ConceptsFormData) => {
    setIsSubmitting(true);
    
    try {
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
      const result = await settingsService.saveSettings({
        ...setupData,
        setupStatus: 'Finished',
      });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating concepts...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Define Concepts
          </CardTitle>
          <p className="text-muted-foreground">
            Step 4 of 4: Concepts
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Concepts */}
            <div className="space-y-2">
              <Label htmlFor="concepts">Key Concepts</Label>
              <p className="text-xs text-muted-foreground mb-3">
               Your social network relies on concepts to generate people, locations and posts.  
                Some have already been populated from your system prompt and world data.
                Please enter additional concepts which you would like to see in your social network below.
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