import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Navigation } from "@/components/Navigation";
import { Feed } from "@/components/Feed";
import { Messages } from "@/components/Messages";
import { settingsService } from "@/services";
import Setup from "./Setup";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [needsSetup, setNeedsSetup] = useState(false);

  const { error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    retry: false,
  });

  useEffect(() => {
    if (error && 'status' in error && error.status === 404) {
      setNeedsSetup(true);
    }
  }, [error]);

  if (needsSetup) {
    return <Setup />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "messages":
        return <Messages />;
      case "profile":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p className="text-muted-foreground">Profile section coming soon!</p>
          </div>
        );
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation onNavigate={setActiveSection} activeSection={activeSection} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
