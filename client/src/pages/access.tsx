import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Shield } from "lucide-react";

export default function AccessPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer hover:opacity-80">
              <div className="border-2 border-white px-3 py-1">
                <span className="text-white text-xl font-serif tracking-wider">ODEL</span>
                <span className="text-white text-[10px] block -mt-1 tracking-widest">ADS PRO</span>
              </div>
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-[40vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('attached_assets/image_1764281393425.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white italic leading-tight mb-6">
            Welcome to OdelAdsPro
          </h1>
          <p className="text-xl md:text-2xl text-white/80">Where Luxury and Rewards Meet</p>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Access Options */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            How would you like to continue?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Access */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="bg-violet-600 text-white p-4 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                User Access
              </h3>
              <p className="text-gray-600 text-center mb-8">
                Join OdelAdsPro to earn money by clicking ads. Register a new account or login to your existing one.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/register">
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-6 text-lg rounded-lg flex items-center justify-center gap-2"
                    data-testid="button-register-access"
                  >
                    Register Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outline"
                    className="w-full border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold py-6 text-lg rounded-lg"
                    data-testid="button-login-access"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admin Access */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="bg-orange-600 text-white p-4 rounded-full">
                  <Shield className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Admin Access
              </h3>
              <p className="text-gray-600 text-center mb-8">
                Manage the platform, approve users, track earnings, and oversee all operations.
              </p>
              <Link href="/admin-login">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 text-lg rounded-lg flex items-center justify-center gap-2"
                  data-testid="button-admin-access"
                >
                  Admin Login
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 OdelAdsPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
