import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Palette } from "lucide-react";
import { ColorVariantManager } from "@/components/admin/ColorVariantManager";
import { toast } from "sonner";

const Settings = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: adminPassword } = useQuery({
    queryKey: ["admin-password"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("password")
        .single();
      
      return data?.password || "Magdi17121997";
    },
  });

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast.success("مرحباً بك!");
    } else {
      toast.error("كلمة المرور غير صحيحة!");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 justify-center">
              <Lock className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">الإعدادات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="أدخل كلمة المرور"
                className="mt-1"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              دخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">إدارة الألوان والمقاسات</h1>
        </div>

        <ColorVariantManager />
      </div>
    </div>
  );
};

export default Settings;
