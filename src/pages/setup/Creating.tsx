import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { settingsService } from "@/services";

const Creating = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const settings = await settingsService.refreshSettings();
      if (settings?.setupStatus === "Finished") {
        navigate("/", { replace: true });
      }
    };

    // Check immediately
    checkStatus();

    // Then poll every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-lg">The network is being created...</p>
    </div>
  );
};

export default Creating;
