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

  const onSubmit = (data: ConceptsFormData) => {
    // Save concepts to localStorage
    localStorage.setItem('setup_concepts', JSON.stringify(data.concepts));
    
    // Navigate to custom concepts step
    navigate("/setup/custom-concepts");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Define Concepts
          </CardTitle>
          <p className="text-muted-foreground">
            Step 4 of 5: Concepts
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
                You can also define custom concepts on the next page.  
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
              >
                Next: Custom Concepts
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptsSetup;