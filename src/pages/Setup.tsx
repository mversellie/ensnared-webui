import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const setupSchema = z.object({
  networkTitle: z.string().min(1, "Network title is required"),
  // System endpoints
  backendApiUrl: z.string().url("Please enter a valid Backend API URL"),
  messengerUrl: z.string().url("Please enter a valid Messenger URL"),
  // LLM endpoints
  openaiApiUrl: z.string().url("Please enter a valid OpenAI API URL"),
  apiToken: z.string().optional(),
});

type SetupFormData = z.infer<typeof setupSchema>;

export const Setup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = (data: SetupFormData) => {
    console.log("Setup data:", data);
    // TODO: Submit to API
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Setup Your Network
          </CardTitle>
          <p className="text-muted-foreground">
            Let's get your social network configured
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

            {/* Endpoints Section */}
            <div className="space-y-6 pt-4 border-t">
              <h3 className="text-lg font-semibold">Endpoints</h3>
              
              {/* System Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">System</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="backendApiUrl">Backend API URL</Label>
                  <Input
                    id="backendApiUrl"
                    placeholder="https://api.example.com"
                    {...register("backendApiUrl")}
                  />
                  {errors.backendApiUrl && (
                    <p className="text-sm text-destructive">{errors.backendApiUrl.message}</p>
                  )}
                </div>

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
              </div>

              {/* LLMs Section */}
              <div className="space-y-4">
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
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;