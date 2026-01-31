import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Facebook, Twitter, Instagram, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const slides = [
  {
    id: 1,
    title: "NEW ARRIVALS",
    subtitle: "COLLECTION",
    discount: "40%",
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "END OF SEASON",
    subtitle: "SALE",
    discount: "30%",
    bg: "bg-gradient-to-br from-orange-600 to-red-500",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "SUMMER STYLE",
    subtitle: "FASHION",
    discount: "25%",
    bg: "bg-gradient-to-br from-amber-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop"
  }
];

const brands = [
  { name: "Levi's", logo: "LEVI'S" },
  { name: "US Polo", logo: "U.S. POLO ASSN." },
  { name: "Armani", logo: "A|X" },
  { name: "Cotton", logo: "cotton COLLECTION" },
  { name: "Calvin Klein", logo: "Calvin Klein" },
];

const products = [
  { id: 1, name: "Calvin Klein Men's Relaxed T-Shirt", price: 15015, oldPrice: 19990, discount: 30, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop" },
  { id: 2, name: "Us Polo Brand Embossed Twill Cap", price: 5565, oldPrice: 7950, discount: 30, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop" },
  { id: 3, name: "Us Polo Mid Rise Regular Fit Trousers", price: 10485, oldPrice: 14950, discount: 30, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop" },
  { id: 4, name: "Us Polo Austin Trim Fit Stretch Trousers", price: 10115, oldPrice: 14450, discount: 30, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&auto=format&fit=crop" },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [brandOffset, setBrandOffset] = useState(0);
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation("/auth/login");
  };

  const handleGetStarted = () => {
    setLocation("/auth/register");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollBrands = (direction: 'left' | 'right') => {
    setBrandOffset(prev => direction === 'left' ? Math.min(prev + 1, 0) : Math.max(prev - 1, -(brands.length - 4)));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="bg-zinc-950 text-white sticky top-0 z-50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-lg font-semibold">ODEL</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation("/auth/login")} 
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                data-testid="button-sign-in"
              >
                Sign In
              </button>
              <Button 
                onClick={() => setLocation("/dashboard")} 
                size="sm"
                className="rounded-full bg-white text-black hover:bg-zinc-200 font-medium px-4 h-8 text-sm"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Sale Banners */}
      <section className="relative overflow-hidden bg-zinc-950 p-3">
        <div className="grid md:grid-cols-2 gap-3 max-w-7xl mx-auto">
          {/* Left Banner - Animated */}
          <AnimatePresence mode="wait">
            {slides.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className={`${slide.bg} rounded-xl p-6 min-h-[280px] md:min-h-[350px] flex flex-col justify-center relative overflow-hidden`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1/2">
                    <img src={slide.image} alt="" className="h-full w-full object-cover opacity-50" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-white/90 text-xs font-medium mb-1 tracking-wide">{slide.title}</p>
                    <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-none">
                      {slide.subtitle}
                    </h2>
                    <p className="text-white text-5xl md:text-7xl font-bold mt-1">{slide.discount}</p>
                    <p className="text-white/60 text-[10px] mt-3 tracking-wider">T&C APPLY</p>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          {/* Right Banner - Static */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 min-h-[280px] md:min-h-[350px] flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop" alt="" className="h-full w-full object-cover opacity-50" />
            </div>
            <div className="relative z-10 text-right">
              <p className="text-white/90 text-xs font-medium mb-1 tracking-wide">END OF SEASON</p>
              <h2 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-none">
                SALE
              </h2>
              <p className="text-white text-5xl md:text-7xl font-bold mt-1">40%</p>
              <p className="text-white/60 text-[10px] mt-3 tracking-wider">T&C APPLY</p>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-orange-500 w-5' : 'bg-zinc-600 w-2'}`}
              data-testid={`button-slide-${i}`}
            />
          ))}
        </div>
      </section>

      {/* Shop by Brand Section */}
      <section className="py-6 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-white font-bold text-xs mb-4 tracking-wide">SHOP BY BRAND</h3>
          <div className="relative">
            <button 
              onClick={() => scrollBrands('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-700 hover:bg-zinc-600 p-2 rounded-full transition-colors"
              data-testid="button-brand-left"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            
            <div className="overflow-hidden mx-10">
              <motion.div 
                className="flex gap-3"
                animate={{ x: brandOffset * 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {brands.map((brand, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="min-w-[160px] bg-white rounded-lg p-4 flex items-center justify-center h-16 cursor-pointer"
                    data-testid={`card-brand-${i}`}
                  >
                    <span className="text-sm font-bold text-gray-800">{brand.logo}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            <button 
              onClick={() => scrollBrands('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-700 hover:bg-zinc-600 p-2 rounded-full transition-colors"
              data-testid="button-brand-right"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-8 max-w-7xl mx-auto px-4 bg-white flex-1">
        <h2 className="text-xl font-bold mb-6 text-gray-900">All Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="group cursor-pointer"
              data-testid={`card-product-${product.id}`}
            >
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {product.discount}%
                </span>
                <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
              </div>
              <h3 className="text-xs font-medium text-gray-800 mb-1.5 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">LKR {product.price.toLocaleString()}</span>
                <span className="text-xs text-gray-400 line-through">LKR {product.oldPrice.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-bold mb-4 text-sm">Customer Care</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Return & Refund</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Service Payment</li>
                <li className="hover:text-white cursor-pointer transition-colors">Store Locator</li>
                <li className="hover:text-white cursor-pointer transition-colors">CRM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Get To Know Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Investor Information</li>
                <li className="hover:text-white cursor-pointer transition-colors">Odel Magazine</li>
              </ul>
              <div className="flex gap-2 mt-4">
                <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                  <Facebook className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Let Us Help You</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">My Account</li>
                <li className="hover:text-white cursor-pointer transition-colors">My Orders</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms Of Use</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">FAQs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Sign up for Newsletter</h4>
              <Input 
                placeholder="Enter your email address" 
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 h-10 text-sm"
                data-testid="input-newsletter"
              />
              <Button 
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white h-10"
                data-testid="button-subscribe"
              >
                Subscribe
              </Button>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8">
            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 mb-4">Shop At Our Group Companies</p>
              <div className="flex justify-center gap-8 items-center">
                <span className="text-base font-bold">mysoftlogic.lk</span>
                <span className="text-lg font-bold">GLOMARK</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              <div className="w-8 h-5 bg-red-600 rounded"></div>
              <div className="w-8 h-5 bg-blue-600 rounded"></div>
              <div className="w-8 h-5 bg-orange-500 rounded"></div>
            </div>
            <p className="text-center text-xs text-gray-500">
              Copyright ©{new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
