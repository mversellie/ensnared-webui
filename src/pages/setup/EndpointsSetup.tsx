import { useState, useRef } from "react";
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
import { AlertCircle } from "lucide-react";

const endpointsSchema = z.object({
  // Messenger (RabbitMQ)
  rabbitHost: z.string().optional(),
  rabbitPort: z.coerce.number().min(1).max(65535).optional(),
  rabbitQueue: z.string().optional(),
  // OpenSearch
  openSearchHost: z.string().optional(),
  openSearchPort: z.coerce.number().min(1).max(65535).optional(),
  openSearchUser: z.string().optional(),
  openSearchPassword: z.string().optional(),
  // LLM endpoints
  llmBaseUrl: z.string().optional(),
  llmModel: z.string().optional(),
  llmApiKey: z.string().optional(),
});

const DEFAULTS = {
  rabbitHost: '',
  rabbitPort: 5672,
  rabbitQueue: '',
  openSearchHost: '',
  openSearchPort: 9200,
  openSearchUser: '',
  openSearchPassword: '',
  llmBaseUrl: '',
  llmModel: '',
  llmApiKey: '',
};

type EndpointsFormData = z.infer<typeof endpointsSchema>;

type TestStatus = 'untested' | 'passing' | 'failing';

export const EndpointsSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track test status and last tested values for each section
  const [rabbitStatus, setRabbitStatus] = useState<TestStatus>('untested');
  const [openSearchStatus, setOpenSearchStatus] = useState<TestStatus>('untested');
  const [llmStatus, setLlmStatus] = useState<TestStatus>('untested');
  
  const lastTestedRabbit = useRef<string>('');
  const lastTestedOpenSearch = useRef<string>('');
  const lastTestedLlm = useRef<string>('');
  
  const cachedSettings = settingsService.getCachedSettings();
  
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EndpointsFormData>({
    resolver: zodResolver(endpointsSchema),
    mode: 'onChange',
    defaultValues: {
      rabbitHost: cachedSettings?.rabbitHost || '',
      rabbitPort: cachedSettings?.rabbitPort ?? undefined,
      rabbitQueue: cachedSettings?.rabbitQueue || '',
      openSearchHost: cachedSettings?.openSearchHost || '',
      openSearchPort: cachedSettings?.openSearchPort ?? undefined,
      openSearchUser: cachedSettings?.openSearchUser || '',
      openSearchPassword: cachedSettings?.openSearchPassword || '',
      llmBaseUrl: cachedSettings?.llmBaseUrl || '',
      llmModel: cachedSettings?.llmModel || '',
      llmApiKey: cachedSettings?.llmApiKey || '',
    },
  });

  const getRabbitFingerprint = (values: EndpointsFormData) => {
    return JSON.stringify({
      host: values.rabbitHost || DEFAULTS.rabbitHost,
      port: values.rabbitPort || DEFAULTS.rabbitPort,
      queue: values.rabbitQueue || DEFAULTS.rabbitQueue,
    });
  };

  const getOpenSearchFingerprint = (values: EndpointsFormData) => {
    return JSON.stringify({
      host: values.openSearchHost || DEFAULTS.openSearchHost,
      port: values.openSearchPort || DEFAULTS.openSearchPort,
      user: values.openSearchUser || DEFAULTS.openSearchUser,
      password: values.openSearchPassword || DEFAULTS.openSearchPassword,
    });
  };

  const getLlmFingerprint = (values: EndpointsFormData) => {
    return JSON.stringify({
      baseUrl: (values.llmBaseUrl || DEFAULTS.llmBaseUrl).trim(),
      model: (values.llmModel || DEFAULTS.llmModel).trim(),
      apiKey: values.llmApiKey?.trim() || '',
    });
  };

  const testRabbit = async (): Promise<boolean> => {
    const values = getValues();
    try {
      const response = await apiRequest('/configuration/test_rabbit', {
        method: 'POST',
        body: JSON.stringify({
          rabbit_host: values.rabbitHost || DEFAULTS.rabbitHost,
          port: values.rabbitPort || DEFAULTS.rabbitPort,
          rabbit_queue: values.rabbitQueue || DEFAULTS.rabbitQueue,
        }),
      }) as { succeeded?: boolean };
      const succeeded = response?.succeeded === true;
      setRabbitStatus(succeeded ? 'passing' : 'failing');
      lastTestedRabbit.current = getRabbitFingerprint(values);
      return succeeded;
    } catch {
      setRabbitStatus('failing');
      lastTestedRabbit.current = getRabbitFingerprint(values);
      return false;
    }
  };

  const testOpenSearch = async (): Promise<boolean> => {
    const values = getValues();
    try {
      const response = await apiRequest('/configuration/test_opensearch', {
        method: 'POST',
        body: JSON.stringify({
          host: values.openSearchHost || DEFAULTS.openSearchHost,
          port: values.openSearchPort || DEFAULTS.openSearchPort,
          user: values.openSearchUser || DEFAULTS.openSearchUser,
          password: values.openSearchPassword || DEFAULTS.openSearchPassword,
        }),
      }) as { succeeded?: boolean };
      const succeeded = response?.succeeded === true;
      setOpenSearchStatus(succeeded ? 'passing' : 'failing');
      lastTestedOpenSearch.current = getOpenSearchFingerprint(values);
      return succeeded;
    } catch {
      setOpenSearchStatus('failing');
      lastTestedOpenSearch.current = getOpenSearchFingerprint(values);
      return false;
    }
  };

  const testLlm = async (): Promise<boolean> => {
    const values = getValues();
    const baseUrl = (values.llmBaseUrl || DEFAULTS.llmBaseUrl).trim();
    const model = (values.llmModel || DEFAULTS.llmModel).trim();
    const apiKey = values.llmApiKey && values.llmApiKey.trim() !== '' ? values.llmApiKey : null;

    try {
      const response = await apiRequest('/configuration/test_llms', {
        method: 'POST',
        body: JSON.stringify({
          base_url: baseUrl,
          model,
          api_key: apiKey,
        }),
      }) as { succeeded?: boolean };
      const succeeded = response?.succeeded === true;
      setLlmStatus(succeeded ? 'passing' : 'failing');
      lastTestedLlm.current = getLlmFingerprint(values);
      return succeeded;
    } catch {
      setLlmStatus('failing');
      lastTestedLlm.current = getLlmFingerprint(values);
      return false;
    }
  };

  const onSubmit = async (data: EndpointsFormData) => {
    setIsSubmitting(true);
    try {
      const values = getValues();
      
      // Determine which sections need testing
      const rabbitChanged = getRabbitFingerprint(values) !== lastTestedRabbit.current;
      const openSearchChanged = getOpenSearchFingerprint(values) !== lastTestedOpenSearch.current;
      const llmChanged = getLlmFingerprint(values) !== lastTestedLlm.current;
      
      const needsRabbitTest = rabbitStatus !== 'passing' || rabbitChanged;
      const needsOpenSearchTest = openSearchStatus !== 'passing' || openSearchChanged;
      const needsLlmTest = llmStatus !== 'passing' || llmChanged;

      // Run required tests in parallel
      const testsToRun: Promise<boolean>[] = [];
      const testNames: string[] = [];
      
      if (needsRabbitTest) {
        testsToRun.push(testRabbit());
        testNames.push('RabbitMQ');
      }
      if (needsOpenSearchTest) {
        testsToRun.push(testOpenSearch());
        testNames.push('OpenSearch');
      }
      if (needsLlmTest) {
        testsToRun.push(testLlm());
        testNames.push('LLM');
      }

      if (testsToRun.length > 0) {
        const results = await Promise.all(testsToRun);
        const failedTests = testNames.filter((_, i) => !results[i]);
        
        if (failedTests.length > 0) {
          toast({
            title: "Connection Failed",
            description: `Failed to connect to: ${failedTests.join(', ')}. Please check your settings.`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // All tests passed - save settings
      const payload: Record<string, any> = {};
      if (data.rabbitHost && data.rabbitHost !== DEFAULTS.rabbitHost) payload.rabbitHost = data.rabbitHost;
      if (data.rabbitPort && data.rabbitPort !== DEFAULTS.rabbitPort) payload.rabbitPort = data.rabbitPort;
      if (data.rabbitQueue && data.rabbitQueue !== DEFAULTS.rabbitQueue) payload.rabbitQueue = data.rabbitQueue;
      if (data.openSearchHost && data.openSearchHost !== DEFAULTS.openSearchHost) payload.openSearchHost = data.openSearchHost;
      if (data.openSearchPort && data.openSearchPort !== DEFAULTS.openSearchPort) payload.openSearchPort = data.openSearchPort;
      if (data.openSearchUser && data.openSearchUser !== DEFAULTS.openSearchUser) payload.openSearchUser = data.openSearchUser;
      if (data.openSearchPassword && data.openSearchPassword !== DEFAULTS.openSearchPassword) payload.openSearchPassword = data.openSearchPassword;
      if (data.llmBaseUrl && data.llmBaseUrl !== DEFAULTS.llmBaseUrl) payload.llmBaseUrl = data.llmBaseUrl;
      if (data.llmModel && data.llmModel !== DEFAULTS.llmModel) payload.llmModel = data.llmModel;

      // Save settings and secrets in parallel
      const savePromises: Promise<any>[] = [];
      
      if (Object.keys(payload).length > 0) {
        savePromises.push(settingsService.saveSettings(payload));
      }
      
      // Send API key to secrets endpoint
      if (data.llmApiKey && data.llmApiKey !== DEFAULTS.llmApiKey) {
        savePromises.push(
          apiRequest('/configuration/secrets', {
            method: 'PUT',
            body: JSON.stringify({ llmApiKey: data.llmApiKey }),
          })
        );
      }
      
      await Promise.all(savePromises);
      await settingsService.saveSettings({
        setupStatus: "Endpoints Configured",
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
            {/* RabbitMQ Section */}
            <div className={`space-y-4 p-4 -mx-4 rounded-lg transition-colors ${rabbitStatus === 'failing' ? 'bg-destructive/10 border border-destructive/30' : ''}`}>
              <h4 className="text-md font-medium text-muted-foreground">RabbitMQ</h4>
              
              {rabbitStatus === 'failing' && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connection failed. Please check your settings.</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="rabbitHost">RabbitMQ Host</Label>
                <Input
                  id="rabbitHost"
                  placeholder="localhost"
                  {...register("rabbitHost")}
                />
                {errors.rabbitHost && (
                  <p className="text-sm text-destructive">{errors.rabbitHost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rabbitPort">RabbitMQ Port</Label>
                <Input
                  id="rabbitPort"
                  type="number"
                  placeholder="5672"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...register("rabbitPort")}
                />
                {errors.rabbitPort && (
                  <p className="text-sm text-destructive">{errors.rabbitPort.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rabbitQueue">RabbitMQ Queue</Label>
                <Input
                  id="rabbitQueue"
                  placeholder="my_queue"
                  {...register("rabbitQueue")}
                />
                {errors.rabbitQueue && (
                  <p className="text-sm text-destructive">{errors.rabbitQueue.message}</p>
                )}
              </div>
            </div>

            {/* OpenSearch Section */}
            <div className={`space-y-4 pt-4 p-4 -mx-4 rounded-lg border-t transition-colors ${openSearchStatus === 'failing' ? 'bg-destructive/10 border border-destructive/30' : ''}`}>
              <h4 className="text-md font-medium text-muted-foreground">OpenSearch</h4>
              
              {openSearchStatus === 'failing' && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connection failed. Please check your settings.</span>
                </div>
              )}
              
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
            <div className={`space-y-4 pt-4 p-4 -mx-4 rounded-lg border-t transition-colors ${llmStatus === 'failing' ? 'bg-destructive/10 border border-destructive/30' : ''}`}>
              <h4 className="text-md font-medium text-muted-foreground">LLMs</h4>
              
              {llmStatus === 'failing' && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connection failed. Please check your settings.</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="llmBaseUrl">LLM Base URL</Label>
                <Input
                  id="llmBaseUrl"
                  placeholder="https://api.openai.com/v1"
                  {...register("llmBaseUrl")}
                />
                {errors.llmBaseUrl && (
                  <p className="text-sm text-destructive">{errors.llmBaseUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="llmModel">Model</Label>
                <Input
                  id="llmModel"
                  placeholder="gpt-4"
                  {...register("llmModel")}
                />
                {errors.llmModel && (
                  <p className="text-sm text-destructive">{errors.llmModel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="llmApiKey">API Key (Optional)</Label>
                <Input
                  id="llmApiKey"
                  type="password"
                  placeholder="sk-..."
                  {...register("llmApiKey")}
                />
                {errors.llmApiKey && (
                  <p className="text-sm text-destructive">{errors.llmApiKey.message}</p>
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
                {isSubmitting ? "Testing..." : "Next: Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointsSetup;
