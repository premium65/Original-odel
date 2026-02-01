import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Shield, TrendingUp } from "lucide-react";
import heroImage from "@assets/login-hero.png";

export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/55 pointer-events-none z-0" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">Rating - Ads</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="link-features">Features</a>
              <a href="#how-it-works" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="link-howitworks">How It Works</a>
              <Link href="/login">
                <Button variant="ghost" className="text-amber-500 hover:text-amber-400" data-testid="button-login">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-amber-500 text-black hover:bg-amber-600" data-testid="button-register">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="text-center max-w-3xl mx-auto px-4 py-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white drop-shadow-lg">
            Welcome to Rating - Ads
          </h1>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-16 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-500">Why Choose Rating - Ads?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Trusted Community</CardTitle>
                <CardDescription>
                  All accounts are verified and approved to ensure a safe and trustworthy environment
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Your data is protected with industry-standard security measures and admin oversight
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Build Reputation</CardTitle>
                <CardDescription>
                  Earn ratings and reviews to establish credibility within the community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-20 py-16 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-500">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-muted-foreground">
                Create your account with basic information. Your account will be reviewed for approval.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Approved</h3>
              <p className="text-muted-foreground">
                Admin reviews your registration to ensure platform safety and quality.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Rating</h3>
              <p className="text-muted-foreground">
                Once approved, share ratings and reviews with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-8 mt-16 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 RateHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
