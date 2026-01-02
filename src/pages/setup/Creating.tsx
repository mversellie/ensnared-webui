import { Loader2 } from "lucide-react";

const Creating = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-lg">The network is being created...</p>
    </div>
  );
};

export default Creating;
