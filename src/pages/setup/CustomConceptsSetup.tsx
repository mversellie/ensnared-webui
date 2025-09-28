import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { settingsService } from "@/services";
import { CustomConceptModal } from "@/components/CustomConceptModal";
import { X, Plus } from "lucide-react";

interface CustomConcept {
  name: string;
  definition: string;
}

export const CustomConceptsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conceptName, setConceptName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customConcepts, setCustomConcepts] = useState<CustomConcept[]>(
    JSON.parse(localStorage.getItem('setup_customConcepts') || '[]')
  );
  const [previousConcepts] = useState<string[]>(
    JSON.parse(localStorage.getItem('setup_concepts') || '[]')
  );

  const handleConceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = conceptName.trim();
    if (trimmed && !customConcepts.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setIsModalOpen(true);
    }
    setConceptName("");
  };

  const handleSaveConcept = (concept: CustomConcept) => {
    const updatedConcepts = [...customConcepts, concept];
    setCustomConcepts(updatedConcepts);
    localStorage.setItem('setup_customConcepts', JSON.stringify(updatedConcepts));
  };

  const removeConcept = (index: number) => {
    const updatedConcepts = customConcepts.filter((_, i) => i !== index);
    setCustomConcepts(updatedConcepts);
    localStorage.setItem('setup_customConcepts', JSON.stringify(updatedConcepts));
  };

  const handleFinalSubmit = async () => {
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
        concepts: JSON.parse(localStorage.getItem('setup_concepts') || '[]'),
        customConcepts: customConcepts,
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
      localStorage.removeItem('setup_customConcepts');

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

  // Filter previous concepts to exclude already defined custom concepts
  const availableSuggestions = previousConcepts.filter(
    concept => !customConcepts.some(c => c.name.toLowerCase() === concept.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Define Custom Concepts
          </CardTitle>
          <p className="text-muted-foreground">
            Step 5 of 5: Custom Concept Definitions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="conceptName">Add Custom Concept</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Enter a concept name and press Enter or click Add to provide a detailed definition.
                Custom concepts help generate more personalized content for your social network.
              </p>
              <form onSubmit={handleConceptSubmit} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="conceptName"
                    list="concept-suggestions"
                    value={conceptName}
                    onChange={(e) => setConceptName(e.target.value)}
                    placeholder="e.g., Quantum Computing"
                  />
                  <datalist id="concept-suggestions">
                    {availableSuggestions.map((concept, index) => (
                      <option key={index} value={concept} />
                    ))}
                  </datalist>
                </div>
                <Button type="submit" size="sm" disabled={!conceptName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {customConcepts.length > 0 && (
              <div className="space-y-2">
                <Label>Custom Concepts ({customConcepts.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {customConcepts.map((concept, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      <span className="truncate max-w-[150px]" title={concept.name}>
                        {concept.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeConcept(index)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/setup/concepts")}
              >
                Back
              </Button>
              <Button 
                onClick={handleFinalSubmit}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomConceptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConcept}
        initialName={conceptName}
      />
    </div>
  );
};

export default CustomConceptsSetup;