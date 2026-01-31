import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  defaultMode?: "login" | "register";
}

export default function AuthPage({ defaultMode = "login" }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuth = async () => {
    if (isLogin) {
      // Handle regular user login
      if (!formData.email || !formData.password) {
        toast({ title: "Please fill email and password", variant: "destructive" });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
          credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
          toast({ title: "Login successful!" });
          // Redirect to dashboard for regular users
          setLocation("/dashboard");
        } else {
          toast({ title: data.error || "Login failed", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Login failed", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Registration logic
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Please agree to terms and conditions", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({ 
          title: "Registration Successful!", 
          description: "Your account is pending admin approval." 
        });
        // Redirect to login after successful registration
        setIsLogin(true);
      } else {
        toast({ title: data.error || "Registration failed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Registration failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setLocation("/welcome");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-2 sm:p-4 ${isLogin ? 'bg-gradient-to-br from-red-900 via-red-800 to-red-900' : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]"
      >
        {/* Left Side - Image - Hidden on small mobile */}
        <div className="hidden sm:block md:w-1/2 relative min-h-[200px] sm:min-h-[250px] md:min-h-auto">
          <motion.img
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={isLogin 
              ? "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop"
            }
            alt="VR Experience"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className={`absolute inset-0 ${isLogin ? 'bg-gradient-to-t from-red-900/60 to-transparent' : 'bg-gradient-to-t from-slate-900/60 to-transparent'}`} />
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-6 left-6 z-20"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-6 text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-auth-title">
              {isLogin ? "Log in" : "Create an Account"}
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              {isLogin ? (
                <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-gray-900 underline font-medium" data-testid="button-switch-to-register">Create an Account</button></>
              ) : (
                <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-gray-900 underline font-medium" data-testid="button-switch-to-login">Log in</button></>
              )}
            </p>

            {/* Form Fields */}
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Username</label>
                    <Input
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-900 text-sm"
                      data-testid="input-username"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">First Name</label>
                      <Input
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="h-11 border-gray-300 focus:border-gray-900 text-sm"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Last Name</label>
                      <Input
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="h-11 border-gray-300 focus:border-gray-900 text-sm"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11 border-gray-300 focus:border-gray-900 text-sm"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="h-11 border-gray-300 focus:border-gray-900 text-sm pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isLogin && (
                  <div className="text-right mt-2">
                    <button className="text-xs text-gray-900 underline" data-testid="button-forgot-password">Forgot Password?</button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full mt-2"
                data-testid="button-submit-auth"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isLogin ? "Logging in..." : "Creating Account..."}
                  </>
                ) : (
                  isLogin ? "Log in" : "Create Account"
                )}
              </Button>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 mt-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="border-gray-300 mt-0.5"
                  data-testid="checkbox-terms"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                  I agree to the <button className="underline font-medium text-gray-900">Terms & Condition</button>
                </label>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">or</span>
                </div>
              </div>

              {/* Replit Auth Button - Primary */}
              <Button
                onClick={handleAuth}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-base"
                data-testid="button-replit-auth"
              >
                Log in with Replit
              </Button>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Button
                  variant="outline"
                  onClick={handleAuth}
                  className="h-10 border-gray-300 hover:bg-gray-50 font-medium rounded-full text-xs"
                  data-testid="button-google"
                >
                  <SiGoogle className="w-4 h-4 text-red-500" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAuth}
                  className="h-10 border-gray-300 hover:bg-gray-50 font-medium rounded-full text-xs"
                  data-testid="button-facebook"
                >
                  <SiFacebook className="w-4 h-4 text-blue-600" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
