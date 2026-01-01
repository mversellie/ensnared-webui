import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Feed } from "@/components/Feed";
import { Messages } from "@/components/Messages";
import { settingsService } from "@/services";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    retry: false,
  });

  // Redirect to setup if setupStatus isn't finished
  if (!isLoading && (!settings || settings.setupStatus !== 'Finished')) {
    navigate('/setup', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
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
