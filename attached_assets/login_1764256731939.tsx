import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import loginBgImage from "@assets/login-hero.png";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }

      const user = await response.json();
      
      if (user.isAdmin !== 1) {
        throw new Error("Access denied. Admin privileges required.");
      }

      toast({
        title: "Welcome Admin!",
        description: `Logged in as ${user.username}`,
      });

      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBgImage})` }}
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="inline-flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
              <Star className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold text-white">Rating - Ads</span>
            </span>
          </Link>
        </div>

        <Card className="border-amber-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in with your admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter admin username"
                          data-testid="input-admin-username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          data-testid="input-admin-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-amber-500 text-black hover:bg-amber-600 font-bold"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-admin-login"
                >
                  {form.formState.isSubmitting ? "Signing in..." : "Admin Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login" data-testid="link-user-login">
                <span className="text-amber-500 hover:text-amber-400 cursor-pointer">
                  Back to User Login
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}