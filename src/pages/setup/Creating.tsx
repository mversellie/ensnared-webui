import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/services/api";

const Creating = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiRequest<{ status: string }>("setup/progress");
        if (response?.status === "Finished") {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Failed to check setup progress:", error);
      }
    };

    checkStatus();
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
