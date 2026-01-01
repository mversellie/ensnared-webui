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

const endpointsSchema = z.object({
  // Messenger
  messengerUrl: z.string().url("Please enter a valid Messenger URL"),
  messengerPort: z.coerce.number().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535"),
  // OpenSearch
  openSearchHost: z.string().min(1, "OpenSearch host is required"),
  openSearchPort: z.coerce.number().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535"),
  // LLM endpoints
  openaiApiUrl: z.string().url("Please enter a valid OpenAI API URL"),
  apiToken: z.string().optional(),
});

type EndpointsFormData = z.infer<typeof endpointsSchema>;

export const EndpointsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cachedSettings = settingsService.getCachedSettings();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EndpointsFormData>({
    resolver: zodResolver(endpointsSchema),
    defaultValues: {
      messengerUrl: cachedSettings?.messengerUrl || '',
      messengerPort: cachedSettings?.messengerPort || 5672,
      openSearchHost: cachedSettings?.openSearchHost || '',
      openSearchPort: cachedSettings?.openSearchPort || 9200,
      openaiApiUrl: cachedSettings?.openaiApiUrl || '',
      apiToken: cachedSettings?.apiToken || '',
    },
  });

  const onSubmit = async (data: EndpointsFormData) => {
    setIsSubmitting(true);
    try {
      await settingsService.saveSettings({
        messengerUrl: data.messengerUrl,
        messengerPort: data.messengerPort,
        openSearchHost: data.openSearchHost,
        openSearchPort: data.openSearchPort,
        openaiApiUrl: data.openaiApiUrl,
        apiToken: data.apiToken,
      });
      await settingsService.saveSettings({
        setupStatus: "EndpointsConfigured",
      });
      navigate("/setup/content");
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
            Configure Endpoints
          </CardTitle>
          <p className="text-muted-foreground">
            Step 2 of 5: System and API Configuration
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Messenger Section */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-muted-foreground">Messenger</h4>
              
              <div className="space-y-2">
                <Label htmlFor="messengerUrl">Messenger URL</Label>
                <Input
                  id="messengerUrl"
                  placeholder="https://messenger.example.com"
                  {...register("messengerUrl")}
                />
                {errors.messengerUrl && (
                  <p className="text-sm text-destructive">{errors.messengerUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="messengerPort">Messenger Port</Label>
                <Input
                  id="messengerPort"
                  type="number"
                  placeholder="5672"
                  {...register("messengerPort")}
                />
                {errors.messengerPort && (
                  <p className="text-sm text-destructive">{errors.messengerPort.message}</p>
                )}
              </div>
            </div>

            {/* OpenSearch Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-md font-medium text-muted-foreground">OpenSearch</h4>
              
              <div className="space-y-2">
                <Label htmlFor="openSearchHost">OpenSearch Host</Label>
                <Input
                  id="openSearchHost"
                  placeholder="localhost"
                  {...register("openSearchHost")}
                />
                {errors.openSearchHost && (
                  <p className="text-sm text-destructive">{errors.openSearchHost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="openSearchPort">OpenSearch Port</Label>
                <Input
                  id="openSearchPort"
                  type="number"
                  placeholder="9200"
                  {...register("openSearchPort")}
                />
                {errors.openSearchPort && (
                  <p className="text-sm text-destructive">{errors.openSearchPort.message}</p>
                )}
              </div>
            </div>

            {/* LLMs Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-md font-medium text-muted-foreground">LLMs</h4>
              
              <div className="space-y-2">
                <Label htmlFor="openaiApiUrl">OpenAI API URL</Label>
                <Input
                  id="openaiApiUrl"
                  placeholder="https://api.openai.com/v1"
                  {...register("openaiApiUrl")}
                />
                {errors.openaiApiUrl && (
                  <p className="text-sm text-destructive">{errors.openaiApiUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token (Optional)</Label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder="sk-..."
                  {...register("apiToken")}
                />
                <p className="text-xs text-muted-foreground">
                  Your API token will be stored securely via Supabase secrets
                </p>
                {errors.apiToken && (
                  <p className="text-sm text-destructive">{errors.apiToken.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/setup/network")}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next: Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointsSetup;