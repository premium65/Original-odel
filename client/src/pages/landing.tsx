import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";

// Products Data
const allProducts = [
  { id: 1, name: 'Backstage Gold Flower Pendant Layered Necklace', code: '249983647', price: 2394, oldPrice: 3990, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'], bg: '#d4a590' },
  { id: 2, name: 'Backstage Silver Necklace', code: '249983655', price: 2394, oldPrice: 3990, images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400'], bg: '#c9a98c' },
  { id: 3, name: 'Backstage Gold 3 Layer Necklace', code: '249983660', price: 1794, oldPrice: 2990, images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400'], bg: '#d4b5a0' },
  { id: 4, name: 'Backstage Gold Block Bracelet', code: '249983665', price: 1194, oldPrice: 1990, images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400'], bg: '#c5a88a' },
  { id: 5, name: 'Backstage Silver Stone Detail Stud Earrings', code: '249983670', price: 1374, oldPrice: 2290, images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=400', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400'], bg: '#2a2a2a' },
  { id: 6, name: 'Backstage Gold And Pearls 5Pc Bracelets', code: '249983675', price: 1794, oldPrice: 2990, images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400'], bg: '#c9a98c' },
  { id: 7, name: 'Backstage Rose Gold Layred Necklace', code: '249983680', price: 2394, oldPrice: 3990, images: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'], bg: '#c5b5a5' },
  { id: 8, name: 'Backstage Black Stone Dangle Earrings', code: '249983685', price: 1794, oldPrice: 2990, images: ['https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=400', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400'], bg: '#2a2a2a' },
];

const mensProducts = [
  { id: 101, name: 'Jack & Jones Olive Mid Rise Cargo Pants', code: '249984001', price: 8970, oldPrice: 0, images: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'], bg: '#f5f5f5', hasSize: true, color: 'Olive' },
  { id: 102, name: 'Jack & Jones Black Mickey Printed Oversized T-Shirt', code: '249984010', price: 8970, oldPrice: 0, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], bg: '#e0d0f0', hasSize: true, color: 'Black' },
  { id: 103, name: 'Jack & Jones Regular Fit Mid Rise Pants - Black', code: '249984020', price: 11970, oldPrice: 0, images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400'], bg: '#f5f5f5', hasSize: true, color: 'Black' },
  { id: 104, name: 'Jack & Jones Dark Blue Knitted Oversized T-Shirt', code: '249984030', price: 5370, oldPrice: 0, images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], bg: '#d0e0f0', hasSize: true, color: 'Blue' },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { branding } = useSettings();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTop, setCurrentTop] = useState(0);
  const [currentHero, setCurrentHero] = useState(0);
  const [countdown, setCountdown] = useState({ days: '09', hours: '11', mins: '31', secs: '17' });
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [authError, setAuthError] = useState('');

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }
      return res.json();
    },
    onSuccess: () => {
      setShowAuthModal(false);
      alert('Registration successful! Please wait for admin approval.');
    },
    onError: (error: any) => {
      setAuthError(error.message);
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsLoggedIn(true);
      setCurrentUser(data.user || data);
      setShowAuthModal(false);
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      setAuthError(error.message);
    }
  });

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown
  useEffect(() => {
    const endTime = Date.now() + 9*24*60*60*1000 + 11*60*60*1000 + 31*60*1000 + 17*1000;
    const interval = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: String(Math.floor(diff/(1000*60*60*24))).padStart(2,'0'),
        hours: String(Math.floor((diff%(1000*60*60*24))/(1000*60*60))).padStart(2,'0'),
        mins: String(Math.floor((diff%(1000*60*60))/(1000*60))).padStart(2,'0'),
        secs: String(Math.floor((diff%(1000*60))/1000)).padStart(2,'0'),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Top slider auto
  useEffect(() => {
    const interval = setInterval(() => setCurrentTop(p => (p + 1) % 3), 4000);
    return () => clearInterval(interval);
  }, []);

  // Hero slider auto
  useEffect(() => {
    const interval = setInterval(() => setCurrentHero(p => (p + 1) % 4), 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = () => {
    if (isLoggedIn) {
      setShowMessageModal(true);
    } else {
      setAuthTab('register');
      setShowAuthModal(true);
    }
  };

  const handleLogin = () => {
    setAuthError('');
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter email and password');
      return;
    }
    loginMutation.mutate({ username: loginEmail, password: loginPassword });
  };

  const handleRegister = () => {
    setAuthError('');
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setAuthError('Please fill in all fields');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    if (!regTerms) {
      setAuthError('Please agree to Terms & Conditions');
      return;
    }
    registerMutation.mutate({
      username: regName.replace(/\s+/g, '').toLowerCase(),
      email: regEmail,
      password: regPassword,
      fullName: regName,
      mobileNumber: regPhone
    });
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const openProduct = (id: number) => {
    const p = [...allProducts, ...mensProducts].find(x => x.id === id);
    if (p) {
      setSelectedProduct(p);
      setMainImage(p.images[0]);
      setSelectedSize('');
      setShowProductModal(true);
    }
  };

  const scrollBrands = (dir: number) => {
    const el = document.getElementById('brandScroll');
    if (el) el.scrollBy({ left: dir * 150, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[9999] transition-opacity duration-500">
          <div className="w-[120px] h-[120px] rounded-3xl flex items-center justify-center shadow-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 20px 60px rgba(249, 115, 22, 0.3)' }}>
            <span className="text-6xl font-bold text-white">O</span>
          </div>
          <h1 className="text-white text-3xl font-bold mt-6 tracking-wider">{branding.siteName?.replace(' ADS', '') || 'ODEL'}</h1>
          <p className="text-orange-500 text-sm font-medium tracking-widest mt-1">ADS</p>
          <div className="flex gap-2 mt-10">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center" onClick={() => setShowMessageModal(false)}>
          <div className="bg-white max-w-[400px] w-[95%] p-6 rounded-xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-headset text-orange-500 text-2xl">📞</i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Required</h3>
            <p className="text-gray-600 mb-6">Please contact Customer Services</p>
            <div className="flex gap-3">
              <button onClick={() => setShowMessageModal(false)} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">Close</button>
              <a href="tel:+94112345678" className="flex-1 h-11 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 flex items-center justify-center gap-2">
                📞 Call Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white max-w-[420px] w-[95%] max-h-[90vh] overflow-y-auto rounded-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 z-10">✕</button>

            <div className="p-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><span className="text-white font-bold text-xl">{(branding.siteName || 'ODEL')[0]}</span></div>
                <span className="text-xl font-bold">{branding.siteName?.replace(' ADS', '') || 'ODEL'}</span>
                <span className="text-orange-500 text-sm font-medium">ADS</span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-orange-700 font-medium">Please register here to get started.</p>
              </div>

              {authError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{authError}</div>}

              <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setAuthTab('login')} className={`flex-1 py-3 text-center font-medium ${authTab === 'login' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}>Sign In</button>
                <button onClick={() => setAuthTab('register')} className={`flex-1 py-3 text-center font-medium ${authTab === 'register' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}>Register</button>
              </div>

              {authTab === 'login' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                    <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Enter your username" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <button onClick={handleLogin} disabled={loginMutation.isPending} className="w-full h-11 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 disabled:opacity-50">
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                  </button>
                  <p className="text-center text-sm text-gray-500">Don't have an account? <span className="text-orange-500 cursor-pointer hover:underline" onClick={() => setAuthTab('register')}>Register</span></p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter your full name" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Enter your email" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Enter your phone number" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Create a password" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="Confirm your password" className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                  </div>
                  <label className="flex items-start gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} className="rounded border-gray-300 mt-1" />
                    <span>I agree to the <a href="#" className="text-orange-500 hover:underline">Terms & Conditions</a></span>
                  </label>
                  <button onClick={handleRegister} disabled={registerMutation.isPending} className="w-full h-11 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 disabled:opacity-50">
                    {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <p className="text-center text-sm text-gray-500">Already have an account? <span className="text-orange-500 cursor-pointer hover:underline" onClick={() => setAuthTab('login')}>Sign In</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
          <div className="bg-white max-w-[1000px] w-full max-h-[90vh] overflow-y-auto rounded-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 z-10 text-gray-500 text-lg">×</button>

            {/* Breadcrumb */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="cursor-pointer hover:text-orange-500" onClick={() => setShowProductModal(false)}>Home</span>
              </p>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* Images Section */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-3">
                  {selectedProduct.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      className={`w-[70px] h-[85px] object-cover rounded-lg cursor-pointer border-2 transition-all ${mainImage === img ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setMainImage(img)}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <img src={mainImage} className="w-full rounded-xl object-cover" />
                </div>
              </div>

              {/* Details Section */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                <p className="text-gray-400 text-sm mb-5">Product Code: {selectedProduct.code}</p>

                {/* Delivery Info */}
                <div className="space-y-2.5 mb-5">
                  <p className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-gray-400 w-5">📦</span> Cash on Delivery
                  </p>
                  <p className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-gray-400 w-5">🔄</span> Easy Exchange & Refund Policy
                  </p>
                  <p className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-gray-400 w-5">🚚</span> Island Wide Delivery
                  </p>
                </div>

                {/* Price */}
                <p className="text-3xl font-bold text-orange-500 mb-1">LKR {selectedProduct.price.toLocaleString()}.00</p>
                {selectedProduct.oldPrice > 0 && (
                  <p className="text-gray-400 line-through mb-2">LKR {selectedProduct.oldPrice.toLocaleString()}.00</p>
                )}

                {/* Installments */}
                <p className="text-sm text-gray-600 mb-1">
                  Or 3 Installments of <span className="font-bold">LKR {Math.round(selectedProduct.price / 3).toLocaleString()}.00</span> with <span className="text-teal-600 font-bold">mintpay</span>
                </p>
                <p className="text-sm text-gray-600 mb-5">
                  Or 3 Installments of <span className="font-bold">LKR {Math.round(selectedProduct.price / 3).toLocaleString()}.00</span> with <span className="text-pink-500 font-bold">KOKO</span>
                </p>

                {/* Color (for clothing) */}
                {selectedProduct.color && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Color: <span className="font-medium">{selectedProduct.color}</span></p>
                    <div className={`w-8 h-8 rounded-full border-2 border-gray-300 ${selectedProduct.color === 'Black' ? 'bg-gray-800' : selectedProduct.color === 'Blue' ? 'bg-blue-600' : selectedProduct.color === 'Olive' ? 'bg-green-700' : 'bg-gray-400'}`}></div>
                  </div>
                )}

                {/* Size Selector */}
                {selectedProduct.hasSize && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Size</p>
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`w-10 h-10 border-2 rounded-lg text-sm font-medium transition-all hover:border-orange-500 ${selectedSize === s ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Tag */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-500 text-lg">🏷️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">40%-EOSS - JAN</p>
                    <p className="text-xs text-gray-500">2026 EXTENSION</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-5">
                  <button
                    onClick={() => { setShowProductModal(false); handleAction(); }}
                    className="flex-1 bg-gray-900 text-white py-3.5 px-6 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => { setShowProductModal(false); handleAction(); }}
                    className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors text-xl text-gray-400"
                  >
                    ♡
                  </button>
                </div>

                {/* Social Share */}
                <div className="flex gap-2">
                  <button onClick={handleAction} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    <span className="text-blue-400">🐦</span> Tweet
                  </button>
                  <button onClick={handleAction} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    <span className="text-blue-600">📘</span> Share
                  </button>
                  <button onClick={handleAction} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    <span>📋</span> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {/* Scroll to Top */}
        {showScrollTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg z-50 flex items-center justify-center hover:bg-orange-600">↑</button>
        )}

        {/* Header */}
        <header className="bg-[#0a0a0a] text-white sticky top-0 z-50 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><span className="text-white font-bold">{(branding.siteName || 'ODEL')[0]}</span></div>
                <span className="text-lg font-bold">{branding.siteName?.replace(' ADS', '') || 'ODEL'}</span>
                <span className="text-orange-500 text-xs font-medium">ADS</span>
              </div>
              {!isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white">Sign In</button>
                  <button onClick={() => { setAuthTab('register'); setShowAuthModal(true); }} className="rounded-full bg-white text-black hover:bg-zinc-200 font-medium px-4 h-8 text-sm">Get Started</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-300">Hi, {currentUser?.username || currentUser?.name}</span>
                  <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Top Banner Slider */}
        <section className="relative overflow-hidden bg-gray-100">
          <div className="flex transition-transform duration-600" style={{ transform: `translateX(-${currentTop * 100}%)` }}>
            <div className="min-w-full h-[200px] flex items-center justify-center relative bg-gradient-to-r from-gray-200 to-gray-100">
              <div className="absolute left-8 top-1/2 -translate-y-1/2">
                <h2 className="text-5xl font-bold text-gray-800">MANGO</h2>
                <p className="text-gray-600 text-sm mt-1">Modern Style. Confident Living</p>
              </div>
            </div>
            <div className="min-w-full h-[200px] flex relative bg-gradient-to-r from-pink-100 to-blue-100">
              <div className="absolute bottom-4 right-8 flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                <span className="text-gray-600">Casual Luxe,</span>
                <span className="bg-red-600 text-white px-3 py-1 font-bold">Levi's®</span>
              </div>
            </div>
            <div className="min-w-full h-[200px] bg-gradient-to-r from-[#f5f0eb] to-[#ebe5df] flex items-center px-12">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Georgia' }}>CARPISA</h2>
                <button onClick={handleAction} className="mt-3 px-5 py-2 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700">BUY NOW 🛒</button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setCurrentTop(i)} className={`h-2 rounded-full ${i === currentTop ? 'bg-orange-500 w-5' : 'bg-gray-400 w-2'}`}></button>
            ))}
          </div>
        </section>

        {/* Sale Marquee */}
        <div className="bg-[#3a3a3a] py-2 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(16)].map((_, i) => <span key={i} className="text-white text-sm mx-3">❯❯❯ SALE HERE</span>)}
          </div>
        </div>

        {/* Flash Sale */}
        <section className="bg-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h2 className="text-2xl font-bold">Flash <span className="text-orange-500">Sale</span></h2>
            <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg">
              <div className="text-center"><span className="text-xl font-bold text-orange-500">{countdown.days}</span><span className="text-[10px] text-gray-400 ml-1">DAYS</span></div>
              <span className="text-orange-500">:</span>
              <div className="text-center"><span className="text-xl font-bold text-orange-500">{countdown.hours}</span><span className="text-[10px] text-gray-400 ml-1">HOURS</span></div>
              <span className="text-orange-500">:</span>
              <div className="text-center"><span className="text-xl font-bold text-orange-500">{countdown.mins}</span><span className="text-[10px] text-gray-400 ml-1">MIN</span></div>
              <span className="text-orange-500">:</span>
              <div className="text-center"><span className="text-xl font-bold text-orange-500">{countdown.secs}</span><span className="text-[10px] text-gray-400 ml-1">SEC</span></div>
            </div>
          </div>
        </section>

        {/* Hero Slider */}
        <section className="relative overflow-hidden bg-[#0a0a0a] p-3">
          <div className="flex transition-transform duration-600" style={{ transform: `translateX(-${currentHero * 100}%)` }}>
            {[
              { from: 'from-orange-500', to: 'to-orange-600', title: 'END OF SEASON', sub: 'SALE', pct: '30%' },
              { from: 'from-red-500', to: 'to-pink-500', title: 'NEW ARRIVALS', sub: 'COLLECTION', pct: '50%' },
              { from: 'from-emerald-500', to: 'to-teal-500', title: 'FLASH SALE', sub: 'TODAY', pct: '60%' },
              { from: 'from-amber-500', to: 'to-orange-500', title: 'CLEARANCE', sub: 'SALE', pct: '70%' },
            ].map((slide, i) => (
              <div key={i} className="min-w-full">
                <div className="grid md:grid-cols-2 gap-3 max-w-7xl mx-auto">
                  <div className={`bg-gradient-to-br ${slide.from} ${slide.to} rounded-xl p-6 min-h-[280px] flex flex-col justify-center relative overflow-hidden`}>
                    <div className="relative z-10">
                      <p className="text-white/80 text-xs mb-1">{slide.title}</p>
                      <h2 className="text-white text-5xl font-bold">{slide.sub}</h2>
                      <p className="text-white text-6xl font-bold mt-1">{slide.pct}</p>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${slide.to} to-red-500 rounded-xl p-6 min-h-[280px] flex flex-col justify-center relative overflow-hidden`}>
                    <div className="relative z-10 text-right">
                      <p className="text-white/80 text-xs mb-1">END OF SEASON</p>
                      <h2 className="text-white text-5xl font-bold">SALE</h2>
                      <p className="text-white text-6xl font-bold mt-1">40%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2, 3].map(i => (
              <button key={i} onClick={() => setCurrentHero(i)} className={`h-2 rounded-full ${i === currentHero ? 'bg-orange-500 w-5' : 'bg-zinc-600 w-2'}`}></button>
            ))}
          </div>
        </section>

        {/* Shop by Brand */}
        <section className="py-4 bg-zinc-800">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-white font-bold text-xs mb-3">SHOP BY BRAND</h3>
            <div className="relative">
              <button onClick={() => scrollBrands(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-700 hover:bg-zinc-600 p-2 rounded-full">◀</button>
              <div className="overflow-hidden mx-10" id="brandScroll">
                <div className="flex gap-3">
                  {["LEVI'S", "U.S. POLO", "A|X", "Calvin Klein", "MANGO", "BACKSTAGE"].map((b, i) => (
                    <div key={i} className="min-w-[130px] bg-white rounded-lg p-3 flex items-center justify-center h-12 cursor-pointer hover:scale-105 transition-transform">
                      <span className="text-sm font-bold text-gray-800">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => scrollBrands(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-700 hover:bg-zinc-600 p-2 rounded-full">▶</button>
            </div>
          </div>
        </section>

        {/* All Products */}
        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">All Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allProducts.map(p => (
                <div key={p.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg" onClick={() => openProduct(p.id)}>
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ background: p.bg }}>
                    <img src={p.images[0]} className="w-full aspect-square object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="bg-gray-800 text-white text-[9px] font-medium px-2 py-0.5 rounded-full">NEW</span>
                      <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">40%</span>
                    </div>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); handleAction(); }}>♡</button>
                  </div>
                  <h3 className="text-xs text-gray-800 mb-1 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">LKR {p.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">LKR {p.oldPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Men's Fashion */}
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">Men's Fashion</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mensProducts.map(p => (
                <div key={p.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg" onClick={() => openProduct(p.id)}>
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ background: p.bg }}>
                    <img src={p.images[0]} className="w-full aspect-[3/4] object-cover" />
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold w-9 h-9 rounded-full flex items-center justify-center">40%</span>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); handleAction(); }}>♡</button>
                  </div>
                  <h3 className="text-xs text-gray-800 mb-1 line-clamp-2">{p.name}</h3>
                  <span className="font-bold text-sm text-gray-900">LKR {p.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1a1a]">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Customer Care</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  {['Return & Refund', 'Contact Us', 'Service Payment', 'Store Locator'].map(l => (
                    <li key={l}><a href="#" onClick={e => { e.preventDefault(); handleAction(); }} className="hover:text-orange-500">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Get To Know Us</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" onClick={e => { e.preventDefault(); handleAction(); }} className="hover:text-orange-500">Investor Information</a></li>
                  <li><a href="#" onClick={e => { e.preventDefault(); handleAction(); }} className="hover:text-orange-500">Odel Magazine</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Let Us Help You</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  {['My Account', 'My Orders', 'Terms Of Use', 'Privacy Policy', 'FAQs'].map(l => (
                    <li key={l}><a href="#" onClick={e => { e.preventDefault(); handleAction(); }} className="hover:text-orange-500">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Sign up for Newsletter</h4>
                <input type="email" placeholder="Enter your email address" className="w-full bg-zinc-800 border border-zinc-700 text-white h-10 text-sm px-4 rounded-md mb-3 focus:outline-none focus:border-orange-500" />
                <button onClick={handleAction} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-semibold text-sm">Subscribe</button>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
              <p className="text-xs text-gray-500">Copyright ©2026 All rights reserved</p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
    </div>
  );
}
