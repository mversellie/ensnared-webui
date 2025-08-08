import { useState, useEffect } from "react";
import { Settings, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const API_ENDPOINT_KEY = "api_endpoint";
const DEFAULT_ENDPOINT = "http://localhost:8000";

export const ApiEndpointWidget = () => {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [tempEndpoint, setTempEndpoint] = useState(DEFAULT_ENDPOINT);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(API_ENDPOINT_KEY);
    if (stored) {
      setEndpoint(stored);
      setTempEndpoint(stored);
    }
  }, []);

  const handleSave = () => {
    // Validate URL format
    try {
      new URL(tempEndpoint);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., http://localhost:8000)",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(API_ENDPOINT_KEY, tempEndpoint);
    setEndpoint(tempEndpoint);
    setIsOpen(false);
    
    toast({
      title: "API Endpoint Updated",
      description: `Endpoint set to: ${tempEndpoint}`,
    });

    // Trigger a custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('apiEndpointChanged', { 
      detail: { endpoint: tempEndpoint } 
    }));
  };

  const handleCancel = () => {
    setTempEndpoint(endpoint);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          title="Change API Endpoint"
        >
          <Globe size={16} />
          <span className="hidden md:inline text-xs">API</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings size={16} />
            <h4 className="font-medium">API Endpoint Settings</h4>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endpoint">API Base URL</Label>
            <Input
              id="endpoint"
              value={tempEndpoint}
              onChange={(e) => setTempEndpoint(e.target.value)}
              placeholder="http://localhost:8000"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Current: <code className="bg-muted px-1 py-0.5 rounded text-xs">{endpoint}</code>
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
              <Check size={14} />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};