import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="border-2 border-white px-3 py-1">
              <span className="text-white text-xl font-serif tracking-wider">ODEL</span>
              <span className="text-white text-[10px] block -mt-1 tracking-widest">ADS PRO</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 rounded-md"
                data-testid="button-login-register"
              >
                Login/Register
              </Button>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
              data-testid="button-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 text-sm rounded-md"
                data-testid="button-login-register-mobile"
              >
                Login/Register
              </Button>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-violet-700/95 backdrop-blur-sm py-4 px-4">
            <div className="flex flex-col gap-3">
              <Link href="/register">
                <span className="text-white hover:text-orange-300 block py-2" data-testid="link-register-mobile">Register</span>
              </Link>
              <Link href="/login">
                <span className="text-white hover:text-orange-300 block py-2" data-testid="link-login-mobile">Login</span>
              </Link>
              <Link href="/access">
                <span className="text-white hover:text-orange-300 block py-2" data-testid="link-admin-mobile">Admin</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('attached_assets/image_1764281393425.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for text readability */}
        <div 
          className="absolute inset-0 bg-black/40"
        />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 hidden md:block">
          <Sparkles className="h-8 w-8 text-white/60" />
        </div>
        <div className="absolute top-32 right-40 hidden md:block">
          <div className="w-2 h-2 bg-white/40 rounded-full" />
        </div>
        <div className="absolute bottom-20 left-20 hidden md:block">
          <Sparkles className="h-6 w-6 text-white/50" />
        </div>

        {/* Orange Triangle Decoration */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderTop: "40px solid #f97316",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white italic leading-tight mb-6">
            Welcome to OdelAdsPro – Where
            <br />
            <span className="font-normal">Luxury and Rewards Meet</span>
          </h1>
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

      {/* What We Do Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative">
              <div 
                className="w-full h-80 md:h-96 rounded-lg overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
                }}
              >
                <div 
                  className="w-full h-full opacity-80"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What We DO
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                OdelAdsPro is more than just an online platform—it is a community built on trust, elegance, and opportunity. We strive to bring a unique experience to our users, combining luxury with innovation in the digital space. Our vision is to create a rewarding system that allows users to enjoy exclusive benefits while engaging with high-quality content.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Earn <span className="font-semibold text-violet-600">101.75 LKR</span> per ad click with our revolutionary reward system. Join thousands of satisfied members who are building their financial future with OdelAdsPro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn Daily</h3>
              <p className="text-gray-600">
                Click ads daily and earn 101.75 LKR per ad. Simple, easy, and rewarding.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Your data and earnings are protected with industry-standard security measures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Withdrawals</h3>
              <p className="text-gray-600">
                Withdraw your earnings directly to your bank account after completing 28 ads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600 text-sm">
                Create your account with your details
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Approved</h3>
              <p className="text-gray-600 text-sm">
                Wait for admin approval
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Click Ads</h3>
              <p className="text-gray-600 text-sm">
                View and click ads to earn rewards
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdraw</h3>
              <p className="text-gray-600 text-sm">
                Cash out your earnings to your bank
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 md:py-24"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join OdelAdsPro today and start your journey towards financial freedom. Get 25,000 LKR bonus on your first day!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg rounded-md"
                data-testid="button-get-started"
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-md"
                data-testid="button-login-cta"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo */}
            <div>
              <div className="border-2 border-white px-3 py-1 inline-block mb-4">
                <span className="text-white text-xl font-serif tracking-wider">ODEL</span>
                <span className="text-white text-[10px] block -mt-1 tracking-widest">ADS PRO</span>
              </div>
              <p className="text-gray-400 text-sm">
                Where Luxury and Rewards Meet
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login">
                    <span className="text-gray-400 hover:text-white text-sm" data-testid="link-footer-login">Login</span>
                  </Link>
                </li>
                <li>
                  <Link href="/register">
                    <span className="text-gray-400 hover:text-white text-sm" data-testid="link-footer-register">Register</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin-login">
                    <span className="text-gray-400 hover:text-white text-sm" data-testid="link-footer-admin">Admin</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">support@odeladspro.com</li>
                <li className="text-gray-400 text-sm">+94 77 123 4567</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">Terms of Service</li>
                <li className="text-gray-400 text-sm">Privacy Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 OdelAdsPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
