import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Setup = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to SocialFlow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            It looks like this is your first time here. Let's get you set up!
          </p>
          
          <div className="space-y-4">
            <Button className="w-full" size="lg">
              Complete Setup
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              This will initialize your SocialFlow instance with default settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;