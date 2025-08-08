import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const setupSchema = z.object({
  networkTitle: z.string().min(1, "Network title is required"),
  username: z.string().min(1, "Username is required"),
  avatar: z.instanceof(FileList).optional(),
});

type SetupFormData = z.infer<typeof setupSchema>;

export const Setup = () => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const avatarFiles = watch("avatar");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SetupFormData) => {
    console.log("Setup data:", data);
    // TODO: Submit to API
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Setup Your Network
          </CardTitle>
          <p className="text-muted-foreground">
            Let's get your social network configured
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Network Title */}
            <div className="space-y-2">
              <Label htmlFor="networkTitle">Network Title</Label>
              <Input
                id="networkTitle"
                placeholder="My Social Network"
                {...register("networkTitle")}
              />
              {errors.networkTitle && (
                <p className="text-sm text-destructive">{errors.networkTitle.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="space-y-4">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="bg-muted">
                    <Upload size={24} className="text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("avatar")}
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an image for your profile
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;