import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import mqImage from "@assets/image_1764261636785.png";
import { Crown } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const user = await response.json();
      console.log("[ADMIN_LOGIN] Login response:", user);
      console.log("[ADMIN_LOGIN] Response status:", response.status);
      console.log("[ADMIN_LOGIN] isAdmin value:", user.isAdmin);
      console.log("[ADMIN_LOGIN] isAdmin type:", typeof user.isAdmin);

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: user || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      const isAdminValue = user.isAdmin ?? user.is_admin;
      if (Number(isAdminValue) !== 1) {
        toast({
          title: "Login Failed",
          description: "Access denied. Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Admin login successful",
      });

      navigate("/admin");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${mqImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500 rounded-full p-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-amber-600 mb-2">
            Admin Login
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your credentials to access the admin panel
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11"
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-amber-500 hover:text-amber-600 font-medium"
              data-testid="link-user-login"
            >
              User Login Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
