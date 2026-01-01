import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { settingsService } from "@/services";

export const Setup = () => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const redirectBasedOnStatus = async () => {
      try {
        const settings = await settingsService.getSettings();
        const status = settings?.setupStatus;

        switch (status) {
          case "Named":
            navigate("/setup/endpoints", { replace: true });
            break;
          case "EndpointsConfigured":
            navigate("/setup/content", { replace: true });
            break;
          case "ContentConfigured":
            navigate("/setup/concepts", { replace: true });
            break;
          case "ConceptsConfigured":
            navigate("/setup/custom-concepts", { replace: true });
            break;
          case "Finished":
            navigate("/", { replace: true });
            break;
          default:
            // "Not Started" or undefined
            navigate("/setup/network", { replace: true });
            break;
        }
      } catch {
        // On error, default to first step
        navigate("/setup/network", { replace: true });
      }
      setIsRedirecting(false);
    };

    redirectBasedOnStatus();
  }, [navigate]);

  if (isRedirecting) return null;

  return null;
};

export default Setup;