import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const networkSchema = z.object({
  networkTitle: z.string().min(1, "Network title is required").max(100, "Network title must be less than 100 characters"),
});

type NetworkFormData = z.infer<typeof networkSchema>;

export const NetworkSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NetworkFormData>({
    resolver: zodResolver(networkSchema),
    defaultValues: {
      networkTitle: settingsService.getCachedSettings()?.networkTitle || '',
    },
  });

  const onSubmit = async (data: NetworkFormData) => {
    setIsSubmitting(true);
    try {
      await settingsService.saveSettings({
        networkTitle: data.networkTitle,
        setupStatus: "Named",
      });
      navigate("/setup/endpoints");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
            Setup Your Network
          </CardTitle>
          <p className="text-muted-foreground">
            Step 1 of 5: Basic Information
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Network Title */}
            <div className="space-y-2">
              <Label htmlFor="networkTitle">Network Title</Label>
              <Input
                id="networkTitle"
                placeholder="My Social Network"
                {...register("networkTitle")}
              />
              {errors.networkTitle && (
                <p className="text-sm text-destructive">{errors.networkTitle.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next: Endpoints"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkSetup;