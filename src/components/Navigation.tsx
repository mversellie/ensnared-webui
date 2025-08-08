import { useState } from "react";
import { Home, MessageCircle, PlusSquare, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "./CreatePostModal";

const navItems = [
  { icon: MessageCircle, label: "Messages", id: "messages" },
  { icon: PlusSquare, label: "Create", id: "create" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Settings, label: "Settings", id: "settings", href: "/settings" },
];

interface NavigationProps {
  onNavigate?: (section: string) => void;
  activeSection?: string;
}

export const Navigation = ({ onNavigate, activeSection = "home" }: NavigationProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleNavClick = (id: string, href?: string) => {
    if (id === "create") {
      setIsCreateModalOpen(true);
    } else if (href) {
      window.location.href = href;
    } else {
      onNavigate?.(id);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-smooth"
                onClick={() => onNavigate?.("home")}
              >
                SocialFlow
              </h1>
              <a 
                href="/setup" 
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Setup (Test)
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              {navItems.map(({ icon: Icon, label, id, href }) => (
                <Button
                  key={id}
                  variant={activeSection === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(id, href)}
                  className="flex items-center gap-2 transition-smooth"
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      <CreatePostModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </>
  );
};