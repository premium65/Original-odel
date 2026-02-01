import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Search, Menu, X, Facebook, Twitter, Instagram, Phone, Mail, MapPin, Copy, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// --- Data Constants ---
const TOP_SLIDER_DATA = [
  {
    id: 1,
    type: "mango",
    title: "MANGO",
    subtitle: "Modern Style. Confident Living",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=150",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=150",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
    ]
  },
  {
    id: 2,
    type: "levis",
    tags: ["Casual Luxe,", "Levi's®", "Legacy"],
    images: [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", bg: "#d4a5a5" },
      { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", bg: "#b8c5d6" },
      { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", bg: "#f0c4d4" },
      { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200", bg: "#e8e4e0" },
      { url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200", bg: "#c5d4e8" },
      { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", bg: "#c8d8c8" },
      { url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200", bg: "#f0d4e0" }
    ]
  },
  {
    id: 3,
    type: "carpisa",
    title: "CARPISA",
    subtitle: "Luxury You\nCan Hold",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=120",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=120"
    ]
  }
];

const HERO_SLIDES = [
  {
    id: 1,
    left: { bg: "from-orange-500 to-orange-600", title: "SALE", subtitle: "END OF SEASON", discount: "30%", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" },
    right: { bg: "from-orange-500 to-red-500", title: "SALE", subtitle: "END OF SEASON", discount: "40%", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" }
  },
  {
    id: 2,
    left: { bg: "from-red-500 to-pink-500", title: "COLLECTION", subtitle: "NEW ARRIVALS", discount: "50%", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800" },
    right: { bg: "from-purple-500 to-pink-500", title: "DEALS", subtitle: "SUMMER SPECIAL", discount: "35%", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" }
  },
  {
    id: 3,
    left: { bg: "from-emerald-500 to-teal-500", title: "TODAY", subtitle: "FLASH SALE", discount: "60%", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800" },
    right: { bg: "from-blue-500 to-indigo-500", title: "MEGA", subtitle: "WEEKEND OFFER", discount: "45%", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800" }
  }
];

const PRODUCTS = [
  { id: 1, name: 'Backstage Gold Flower Pendant Layered Necklace', code: '249983647', price: 2394, oldPrice: 3990, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400'], bg: '#d4a590' },
  { id: 2, name: 'Backstage Silver Necklace', code: '249983655', price: 2394, oldPrice: 3990, images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'], bg: '#c9a98c' },
  { id: 3, name: 'Backstage Gold 3 Layer Necklace', code: '249983660', price: 1794, oldPrice: 2990, images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'], bg: '#d4b5a0' },
  { id: 4, name: 'Backstage Gold Block Bracelet', code: '249983665', price: 1194, oldPrice: 1990, images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400'], bg: '#c5a88a' },
];

const MENS_PRODUCTS = [
  { id: 101, name: 'Jack & Jones Olive Mid Rise Cargo Pants', code: '249984001', price: 8970, oldPrice: 0, images: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'], bg: '#f5f5f5', hasSize: true, color: 'Olive' },
  { id: 102, name: 'Jack & Jones Black Mickey Printed Oversized T-Shirt', code: '249984010', price: 8970, oldPrice: 0, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], bg: '#e0d0f0', hasSize: true, color: 'Black' },
];

const BRANDS = ["LEVI'S", "U.S. POLO", "A|X", "Calvin Klein", "MANGO", "BACKSTAGE"];

// --- Components ---

function Splash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col items-center justify-center">
      <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.3)] animate-pulse">
        <span className="text-7xl font-bold text-white">O</span>
      </div>
      <h1 className="text-white text-4xl font-bold mt-8 tracking-wider">ODEL</h1>
      <p className="text-orange-500 text-sm font-medium tracking-[0.3em] mt-2">ADS</p>
      <div className="flex gap-2 mt-12">
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0s]" />
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}

function ProductModal({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) {
  const [activeImage, setActiveImage] = useState(0);

  if (!isOpen || !product) return null;

  const installment = Math.round(product.price / 3).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-orange-500">
            <ChevronLeft className="w-4 h-4 inline mr-1" /> Back to Store
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50">
              <img src={product.images[activeImage]} className="w-full h-full object-cover" alt={product.name} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Product Code: {product.code}</p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Search className="w-4 h-4" /></div>
                <span>Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Share2 className="w-4 h-4" /></div>
                <span>Easy Exchange & Refund Policy</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-orange-500">LKR {product.price.toLocaleString()}.00</span>
                {product.oldPrice > 0 && (
                  <span className="text-lg text-gray-400 line-through">LKR {product.oldPrice.toLocaleString()}.00</span>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs text-gray-600">Or 3 Installments of <b>LKR {installment}</b> with <span className="text-teal-600 font-bold">mintpay</span></p>
                <p className="text-xs text-gray-600">Or 3 Installments of <b>LKR {installment}</b> with <span className="text-pink-500 font-bold">KOKO</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full font-semibold">
                Add to Cart
              </Button>
              <button className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();
  const [topSlide, setTopSlide] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Auth hooks
  const { user, loginMutation, registerMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleAuth = async () => {
    try {
      if (authTab === 'login') {
        await loginMutation.mutateAsync({ username: email, password }); // Using email as username for simplicity or adapt as needed
      } else {
        await registerMutation.mutateAsync({ username: email, password }); // Setup proper fields
      }
      setShowAuthModal(false);
    } catch (e) {
      console.error(e);
      // Handle error (toast)
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    const topTimer = setInterval(() => {
      setTopSlide(prev => (prev + 1) % TOP_SLIDER_DATA.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(topTimer);
    };
  }, []);

  if (loading) return <Splash onComplete={() => setLoading(false)} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-orange-500 selection:text-white">
      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white">
          <div className="p-6">
            <div className="flex justify-center flex-col items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-bold text-2xl">O</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ODEL <span className="text-orange-500 text-sm">ADS</span></h2>
            </div>

            <div className="flex mb-6 border-b">
              <button
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${authTab === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}
                onClick={() => setAuthTab('login')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${authTab === 'register' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}
                onClick={() => setAuthTab('register')}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email / Username</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="bg-gray-50 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="bg-gray-50 border-gray-200" />
              </div>

              <Button onClick={handleAuth} className="w-full bg-gray-900 hover:bg-gray-800 h-11 text-base">
                {authTab === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">ODEL</h1>
              <span className="text-orange-500 text-[10px] font-bold tracking-widest block">ADS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">Hi, {user.username}</span>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-white hover:text-orange-500">Dashboard</Button>
              </div>
            ) : (
              <>
                <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</button>
                <Button onClick={() => { setAuthTab('register'); setShowAuthModal(true); }} size="sm" className="bg-white text-black hover:bg-gray-200 rounded-full px-5 font-medium">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Top Slider Section */}
      <section className="relative bg-white overflow-hidden h-[300px] md:h-[500px]">
        <AnimatePresence mode="wait">
          {(() => {
            const slide = TOP_SLIDER_DATA[topSlide];
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* 1. MANGO LAYOUT (Split) */}
                {slide.type === 'mango' && (
                  <div className="flex w-full h-full">
                    <div className="w-1/4 relative hidden md:block overflow-hidden">
                      <img src={slide.images[0]} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                    </div>
                    <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center relative z-10 px-8">
                      <h2 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter mb-4 font-serif">MANGO</h2>
                      <p className="text-xs md:text-sm tracking-[0.3em] text-gray-500 uppercase">Modern Style. Confident Living</p>
                    </div>
                    <div className="w-1/4 relative hidden md:block overflow-hidden">
                      <img src={slide.images[1]} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                    </div>
                    {/* Mobile Background */}
                    <div className="absolute inset-0 md:hidden z-0">
                      <img src={slide.images[0]} className="w-full h-full object-cover opacity-20" />
                    </div>
                  </div>
                )}

                {/* 2. LEVIS LAYOUT (Grid Strip) */}
                {slide.type === 'levis' && (
                  <div className="w-full h-full flex flex-col bg-white">
                    <div className="flex-1 flex overflow-hidden">
                      {slide.images.slice(0, 6).map((imgItem: any, idx: number) => (
                        <div key={idx} className="flex-1 relative border-r border-white/20 min-w-0" style={{ backgroundColor: imgItem.bg }}>
                          <img src={imgItem.url} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                        </div>
                      ))}
                    </div>
                    <div className="h-24 md:h-32 bg-white flex items-center justify-center gap-4 md:gap-8 px-4">
                      <span className="text-xl md:text-3xl text-gray-600 font-light">Casual Luxe,</span>
                      <div className="bg-[#c4122d] text-white px-4 py-1 md:px-6 md:py-2 transform -skew-x-12">
                        <span className="text-xl md:text-3xl font-bold italic block transform skew-x-12">Levi's®</span>
                      </div>
                      <span className="text-xl md:text-3xl text-gray-600 font-light">Legacy</span>
                    </div>
                  </div>
                )}

                {/* 3. CARPISA LAYOUT (Banner Left, Products Right) */}
                {slide.type === 'carpisa' && (
                  <div className="w-full h-full flex bg-[#fdfbf7]">
                    <div className="flex-1 flex flex-col justify-center px-12 md:px-24">
                      <h2 className="text-5xl md:text-7xl font-light text-gray-800 mb-2">CARPISA</h2>
                      <div className="w-20 h-1 bg-black mb-8" />
                      <div className="font-serif text-3xl md:text-5xl text-gray-400 italic">
                        Luxury You <br /> Can Hold
                      </div>
                      <Button className="mt-8 w-fit bg-[#cf1010] hover:bg-[#b00d0d] text-white rounded-full px-8 py-6 text-sm tracking-widest">
                        BUY NOW
                      </Button>
                    </div>
                    <div className="w-1/2 hidden md:flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fdfbf7] z-10" />
                      {/* Composition of bags */}
                      <div className="relative w-full h-full">
                        <img src={slide.images[0]} className="absolute top-10 right-10 w-64 h-64 object-contain z-10 drop-shadow-2xl" />
                        <img src={slide.images[1]} className="absolute bottom-10 left-20 w-56 h-56 object-contain z-20 drop-shadow-xl" />
                        <img src={slide.images[2]} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 object-contain z-0 opacity-50 blur-[2px]" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {TOP_SLIDER_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => setTopSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all border border-gray-400 ${i === topSlide ? 'bg-gray-800 w-8' : 'bg-transparent hover:bg-gray-200'
                }`}
            />
          ))}
        </div>
      </section>


      {/* Marquee */}
      <div className="bg-[#1a1a1a] py-3 overflow-hidden border-y border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-xs font-bold text-gray-500 mx-8 tracking-widest flex items-center gap-2">
              SALE IS LIVE <span className="text-orange-500">●</span> 50% OFF
            </span>
          ))}
        </div>
      </div>

      {/* Hero Slideshow */}
      <section className="p-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-4 min-h-[400px]"
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${HERO_SLIDES[heroSlide].left.bg} p-8 flex flex-col justify-center`}>
                  <img src={HERO_SLIDES[heroSlide].left.img} className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60 mix-blend-overlay" />
                  <div className="relative z-10">
                    <p className="text-white/80 text-xs font-bold tracking-widest mb-2">{HERO_SLIDES[heroSlide].left.subtitle}</p>
                    <h2 className="text-6xl font-black text-white mb-2">{HERO_SLIDES[heroSlide].left.title}</h2>
                    <p className="text-7xl font-black text-white/90">{HERO_SLIDES[heroSlide].left.discount}</p>
                    <Button className="mt-6 w-fit bg-white text-black hover:bg-gray-100 rounded-full px-8">Shop Now</Button>
                  </div>
                </div>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${HERO_SLIDES[heroSlide].right.bg} p-8 flex flex-col justify-center text-right`}>
                  <img src={HERO_SLIDES[heroSlide].right.img} className="absolute left-0 top-0 h-full w-2/3 object-cover opacity-60 mix-blend-overlay" />
                  <div className="relative z-10 flex flex-col items-end">
                    <p className="text-white/80 text-xs font-bold tracking-widest mb-2">{HERO_SLIDES[heroSlide].right.subtitle}</p>
                    <h2 className="text-6xl font-black text-white mb-2">{HERO_SLIDES[heroSlide].right.title}</h2>
                    <p className="text-7xl font-black text-white/90">{HERO_SLIDES[heroSlide].right.discount}</p>
                    <Button className="mt-6 w-fit bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 rounded-full px-8">Explore</Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroSlide ? 'bg-white w-8' : 'bg-white/30 w-4'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* Brands */}
      < section className="py-8 bg-[#141414]" >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-xs tracking-widest">SHOP BY BRAND</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {BRANDS.map((brand, i) => (
              <div key={i} className="min-w-[140px] h-16 bg-white rounded-xl flex items-center justify-center font-bold text-gray-800 hover:scale-105 transition-transform cursor-pointer">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Products Grid */}
      < section className="py-12 bg-white rounded-t-[40px]" >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PRODUCTS.map(product => (
              <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative mb-4" style={{ backgroundColor: product.bg }}>
                  <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full">NEW</span>
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">40% OFF</span>
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 leading-relaxed">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">LKR {product.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">LKR {product.oldPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-[#111] text-gray-400 py-12 border-t border-white/5" >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-white font-bold mb-6">Customer Care</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Payment Methods</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Newsletter</h4>
              <p className="text-sm mb-4">Subscribe for latest updates and offers.</p>
              <div className="flex gap-2">
                <Input placeholder="Email address" className="bg-white/5 border-white/10" />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Join</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            <p>&copy; 2026 ODEL ADS. All Rights Reserved.</p>
          </div>
        </div>
      </footer >
    </div >
  );
}

