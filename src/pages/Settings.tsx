import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Settings as SettingsIcon } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SocialLinks } from "@/components/SocialLinks";
import { toast } from "sonner";

const Settings = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: adminPassword } = useQuery({
    queryKey: ["admin-password"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "admin_password")
        .single();
      
      if (error) {
        // If no password exists, insert the default one
        const { data: newPassword } = await supabase
          .from("site_settings")
          .insert([{ key: "admin_password", value: "01278006248m" }])
          .select()
          .single();
        return newPassword?.value || "01278006248m";
      }
      return data?.value || "01278006248m";
    },
  });

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast.success("مرحباً بك في لوحة التحكم!");
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
              <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
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
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <AdminDashboard />
          </div>
          <div className="space-y-6">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
