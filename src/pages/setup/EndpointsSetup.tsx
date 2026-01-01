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
import { apiRequest } from "@/services/api";

const endpointsSchema = z.object({
  // Messenger
  messengerUrl: z.string().optional(),
  messengerPort: z.coerce.number().min(1).max(65535).optional(),
  // OpenSearch
  openSearchHost: z.string().optional(),
  openSearchPort: z.coerce.number().min(1).max(65535).optional(),
  openSearchUser: z.string().optional(),
  openSearchPassword: z.string().optional(),
  // LLM endpoints
  openaiApiUrl: z.string().optional(),
  apiToken: z.string().optional(),
});

const DEFAULTS = {
  messengerUrl: '',
  messengerPort: 5672,
  openSearchHost: '',
  openSearchPort: 9200,
  openSearchUser: '',
  openSearchPassword: '',
  openaiApiUrl: '',
  apiToken: '',
};

type EndpointsFormData = z.infer<typeof endpointsSchema>;

export const EndpointsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingOpenSearch, setIsTestingOpenSearch] = useState(false);
  const cachedSettings = settingsService.getCachedSettings();
  
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EndpointsFormData>({
    resolver: zodResolver(endpointsSchema),
    defaultValues: {
      messengerUrl: cachedSettings?.messengerUrl || '',
      messengerPort: cachedSettings?.messengerPort ?? undefined,
      openSearchHost: cachedSettings?.openSearchHost || '',
      openSearchPort: cachedSettings?.openSearchPort ?? undefined,
      openSearchUser: cachedSettings?.openSearchUser || '',
      openSearchPassword: cachedSettings?.openSearchPassword || '',
      openaiApiUrl: cachedSettings?.openaiApiUrl || '',
      apiToken: cachedSettings?.apiToken || '',
    },
  });


  const testOpenSearch = async () => {
    setIsTestingOpenSearch(true);
    try {
      const values = getValues();
      await apiRequest('/configuration/test_opensearch', {
        method: 'POST',
        body: JSON.stringify({
          host: values.openSearchHost || DEFAULTS.openSearchHost,
          port: values.openSearchPort || DEFAULTS.openSearchPort,
          user: values.openSearchUser || DEFAULTS.openSearchUser,
          password: values.openSearchPassword || DEFAULTS.openSearchPassword,
        }),
      });
      toast({
        title: "Success",
        description: "OpenSearch connection test passed.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to OpenSearch. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsTestingOpenSearch(false);
    }
  };

  const onSubmit = async (data: EndpointsFormData) => {
    setIsSubmitting(true);
    try {
      // Only submit fields that differ from defaults
      const payload: Record<string, any> = {};
      if (data.messengerUrl && data.messengerUrl !== DEFAULTS.messengerUrl) payload.messengerUrl = data.messengerUrl;
      if (data.messengerPort && data.messengerPort !== DEFAULTS.messengerPort) payload.messengerPort = data.messengerPort;
      if (data.openSearchHost && data.openSearchHost !== DEFAULTS.openSearchHost) payload.openSearchHost = data.openSearchHost;
      if (data.openSearchPort && data.openSearchPort !== DEFAULTS.openSearchPort) payload.openSearchPort = data.openSearchPort;
      if (data.openSearchUser && data.openSearchUser !== DEFAULTS.openSearchUser) payload.openSearchUser = data.openSearchUser;
      if (data.openSearchPassword && data.openSearchPassword !== DEFAULTS.openSearchPassword) payload.openSearchPassword = data.openSearchPassword;
      if (data.openaiApiUrl && data.openaiApiUrl !== DEFAULTS.openaiApiUrl) payload.openaiApiUrl = data.openaiApiUrl;
      if (data.apiToken && data.apiToken !== DEFAULTS.apiToken) payload.apiToken = data.apiToken;

      if (Object.keys(payload).length > 0) {
        await settingsService.saveSettings(payload);
      }
      await settingsService.saveSettings({
        setupStatus: "EndpointsConfigured",
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...register("messengerPort")}
                />
                {errors.messengerPort && (
                  <p className="text-sm text-destructive">{errors.messengerPort.message}</p>
                )}
              </div>
            </div>

            {/* OpenSearch Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-muted-foreground">OpenSearch</h4>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={testOpenSearch}
                  disabled={isTestingOpenSearch}
                >
                  {isTestingOpenSearch ? "Testing..." : "Test Connection"}
                </Button>
              </div>
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...register("openSearchPort")}
                />
                {errors.openSearchPort && (
                  <p className="text-sm text-destructive">{errors.openSearchPort.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="openSearchUser">OpenSearch Username</Label>
                <Input
                  id="openSearchUser"
                  placeholder="admin"
                  {...register("openSearchUser")}
                />
                {errors.openSearchUser && (
                  <p className="text-sm text-destructive">{errors.openSearchUser.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="openSearchPassword">OpenSearch Password</Label>
                <Input
                  id="openSearchPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("openSearchPassword")}
                />
                {errors.openSearchPassword && (
                  <p className="text-sm text-destructive">{errors.openSearchPassword.message}</p>
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