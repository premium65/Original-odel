import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

// Sidebar items
const sidebarItems = [
  { icon: "fa-th-large", label: "Dashboard", path: "/dashboard" },
  { icon: "fa-gem", label: "Exclusives", path: "/exclusives" },
  { icon: "fa-bullseye", label: "Ad's Hub", path: "/ads-hub" },
  { icon: "fa-crown", label: "Status", path: "/status" },
  { icon: "fa-magic", label: "Events", path: "/events" },
  { icon: "fa-phone-alt", label: "Contact", path: "/contact" },
  { icon: "fa-cog", label: "Settings", path: "/settings" },
];

// Product data
const jerseyProducts = [
  { image: "https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=400", title: "Moose Men's National Tour 2025", price: "LKR 3,490", oldPrice: "", code: "MCR540", badge: "NEW", bgColor: "from-gray-50 to-gray-100" },
  { image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400", title: "Practice Tank Blue Edition", price: "LKR 2,490", oldPrice: "", code: "MCR538", badge: "HOT", bgColor: "from-cyan-50 to-cyan-100" },
  { image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400", title: "Test Top White Blue", price: "LKR 2,990", oldPrice: "", code: "MCR536", badge: "NEW", bgColor: "from-blue-50 to-blue-100" },
  { image: "https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?w=400", title: "T20 Top Yellow Edition", price: "LKR 2,990", oldPrice: "", code: "MCR535", badge: "SALE", bgColor: "from-yellow-50 to-yellow-100" },
  { image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400", title: "Adidas Lifestyle Cotton Polo", price: "LKR 7,475", oldPrice: "LKR 14,950", code: "ADS-LP01", badge: "50% OFF", bgColor: "from-gray-50 to-gray-100" },
];

const watchProducts = [
  { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", title: "Rado Captain Cook Unisex", price: "LKR 870,000", code: "R32223203", badge: "LUXURY" },
  { image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", title: "Rado True Square Unisex", price: "LKR 1,150,000", code: "R27187152", badge: "PREMIUM" },
  { image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400", title: "Rado DiaStar Original", price: "LKR 640,000", code: "R12065303", badge: "CLASSIC" },
  { image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400", title: "Rado True Square R27073712", price: "LKR 1,190,000", code: "R27073712", badge: "LUXURY" },
  { image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400", title: "Rado Centrix Gold", price: "LKR 950,000", code: "R30554713", badge: "PREMIUM" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { branding } = useSettings();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("Rewards");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [, setLocation] = useLocation();

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: "01", hours: "10", mins: "27", secs: "46" });

  useEffect(() => {
    const endTime = Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000 + 27 * 60 * 1000 + 46 * 1000;

    const timer = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) return;

      setCountdown({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0"),
        mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0"),
        secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollSlider = (sliderId: string, direction: number) => {
    const slider = document.getElementById(sliderId);
    if (slider) slider.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  const userName = user?.firstName || user?.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const tabs = ["Exclusives", "Ads Hub", "Rewards", "Events", "Promos", "Status"];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Sidebar */}
      <aside className={`fixed h-full z-40 bg-[#0a0a0a] border-r border-zinc-800 flex flex-col transition-all duration-300 ${sidebarExpanded ? "w-[200px]" : "w-[70px]"}`}>
        <div className="p-4 flex items-center justify-center">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <i className="fas fa-th-large text-white text-lg" />
          </button>
          {sidebarExpanded && <span className="ml-3 text-white font-bold text-lg whitespace-nowrap">Dashboard</span>}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-orange-500/10 transition-all ${sidebarExpanded ? "justify-start" : "justify-center"}`}>
                <i className={`fas ${item.icon} w-5 text-center text-lg`} />
                {sidebarExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-zinc-800">
          <Link href="/">
            <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white transition-all ${sidebarExpanded ? "justify-start" : "justify-center"}`}>
              <i className="fas fa-sign-out-alt w-5 text-center text-lg" />
              {sidebarExpanded && <span className="text-sm whitespace-nowrap">Sign Out</span>}
            </a>
          </Link>
          <div className={`flex items-center gap-3 px-3 py-3 mt-2 ${sidebarExpanded ? "justify-start" : "justify-center"}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{userInitial}</span>
            </div>
            {sidebarExpanded && <span className="text-white text-sm font-medium whitespace-nowrap">{userName}</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 bg-white transition-all duration-300 ${sidebarExpanded ? "ml-[200px]" : "ml-[70px]"}`}>
        {/* Top Marquee */}
        <div className="bg-[#0a0a0a] py-2 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[1, 2, 3].map((i) => (
              <span key={i} className="flex items-center text-sm ml-8">
                <span className="text-orange-500 mx-2">&gt;&gt;&gt; $</span>
                <span className="text-white font-medium">CLICK ADS & WIN</span>
                <span className="text-orange-500 mx-2">&gt;&gt;&gt; $</span>
                <span className="text-white font-medium">RATING ADS</span>
                <span className="text-orange-500 mx-2">&gt;&gt;&gt; $</span>
                <span className="text-white font-medium">EARN MORE TODAY</span>
              </span>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-6 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h1 className="text-gray-900 text-2xl lg:text-3xl font-bold">Hi {userName}!</h1>
            <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-full transition-all ${activeTab === tab ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-12 gap-4 mb-6">
            {/* Left Column - Stats */}
            <div className="lg:col-span-4 space-y-4">
              {/* Balance Card */}
              <div className="bg-[#1a1a1a] rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-orange-500" />
                  </div>
                  <span className="text-gray-400 text-sm">Balance</span>
                </div>
                <p className="text-white text-3xl font-bold">LKR {user?.balance || "0"}</p>
                <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                  <i className="fas fa-arrow-trend-up text-xs" />
                  +0.00
                </p>
              </div>

              {/* Ads Progress Card */}
              <div className="bg-[#1a1a1a] rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <i className="fas fa-bullseye text-cyan-500" />
                  </div>
                  <span className="text-gray-400 text-sm">Ads Progress</span>
                </div>
                <p className="text-white text-3xl font-bold">{user?.totalAdsCompleted || 0}/28</p>
                <div className="mt-3 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full" style={{ width: `${((user?.totalAdsCompleted || 0) / 28) * 100}%` }} />
                </div>
              </div>

              {/* Account Status Card */}
              <div className="bg-[#1a1a1a] rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Account Status</p>
                    <p className="text-green-500 text-lg font-semibold capitalize">{user?.status || "Active"}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-500 text-xl" />
                  </div>
                </div>
              </div>

              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                See all <i className="fas fa-chevron-right text-sm" />
              </button>
            </div>

            {/* Right Column - Video */}
            <div className="lg:col-span-8">
              <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                <div className="relative h-[400px] lg:h-[420px]">
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" className="w-full h-full object-cover" alt="Video thumbnail" />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-semibold">LIVE</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <i className="fas fa-dollar-sign text-green-400 text-xs" />
                      <span className="text-white text-sm font-medium">{user?.points || 100}</span>
                    </div>
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <i className="fas fa-bullseye text-cyan-400 text-xs" />
                      <span className="text-white text-sm font-medium">{user?.totalAdsCompleted || 0}</span>
                    </div>
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <i className="fas fa-bolt text-yellow-400 text-xs" />
                      <span className="text-white text-sm font-medium">{user?.milestoneAmount || "0.00"}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <i className="fas fa-play text-white text-lg" />
                      </button>
                      <div>
                        <p className="text-white font-semibold">Watch & Earn</p>
                        <p className="text-gray-300 text-sm">{branding.siteName || 'ODEL ADS'}</p>
                      </div>
                      <div className="ml-auto text-gray-300 text-sm">
                        <span className="text-white">3:40</span> / 3:02
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600", title: "Daily Rewards", badge: "Active", badgeColor: "bg-green-500" },
              { image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600", title: "Bonus Zone", badge: "Hot", badgeColor: "bg-red-500" },
              { image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600", title: "VIP Promos", badge: "New", badgeColor: "bg-orange-500" },
              { image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600", title: "Exclusive Ads", badge: "Premium", badgeColor: "bg-orange-500" },
            ].map((card, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden cursor-pointer group h-36 hover:shadow-lg transition-all hover:-translate-y-1">
                <img src={card.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={card.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className={`absolute top-3 right-3 ${card.badgeColor} text-white text-[10px] font-semibold px-2.5 py-1 rounded-full`}>{card.badge}</span>
                <p className="absolute bottom-4 left-4 text-white font-semibold">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Flash Sale */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-white text-2xl font-bold">Flash <span className="text-orange-500">Sale</span></h2>
              <p className="text-gray-400 text-sm">Limited time offer - Don't miss out!</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: countdown.days, label: "DAYS", highlight: false },
                { value: countdown.hours, label: "HOURS", highlight: false },
                { value: countdown.mins, label: "MINUTES", highlight: true },
                { value: countdown.secs, label: "SECONDS", highlight: true },
              ].map((item, i) => (
                <div key={i} className="bg-[#252525] rounded-xl p-4 text-center">
                  <p className={`text-3xl lg:text-4xl font-bold ${item.highlight ? "text-orange-500" : "text-white"}`}>{item.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Jersey Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold text-lg">Sports & Jersey</h3>
              <div className="flex gap-2">
                <button onClick={() => scrollSlider("jersey-slider", -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-chevron-left text-gray-600 text-sm" />
                </button>
                <button onClick={() => scrollSlider("jersey-slider", 1)} className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center">
                  <i className="fas fa-chevron-right text-white text-sm" />
                </button>
              </div>
            </div>
            <div id="jersey-slider" className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
              {jerseyProducts.map((product, i) => (
                <div key={i} onClick={() => setSelectedProduct(product)} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className={`relative h-56 bg-gradient-to-b ${product.bgColor} flex items-center justify-center`}>
                    <img src={product.image} className="h-48 object-contain group-hover:scale-105 transition-transform duration-300" alt={product.title} />
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
                      <i className="far fa-heart text-gray-400" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-800 text-sm font-medium truncate">{product.title}</p>
                    <p className="text-orange-500 font-bold">{product.price}</p>
                    {product.oldPrice && <p className="text-gray-400 text-xs line-through">{product.oldPrice}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Watches Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold text-lg">Luxury Watches</h3>
              <div className="flex gap-2">
                <button onClick={() => scrollSlider("watch-slider", -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-chevron-left text-gray-600 text-sm" />
                </button>
                <button onClick={() => scrollSlider("watch-slider", 1)} className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center">
                  <i className="fas fa-chevron-right text-white text-sm" />
                </button>
              </div>
            </div>
            <div id="watch-slider" className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
              {watchProducts.map((product, i) => (
                <div key={i} onClick={() => setSelectedProduct(product)} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-56 bg-white flex items-center justify-center">
                    <img src={product.image} className="h-48 object-contain group-hover:scale-105 transition-transform duration-300" alt={product.title} />
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
                      <i className="far fa-heart text-gray-400" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-blue-600 text-sm font-medium truncate">{product.title}</p>
                    <p className="text-gray-500 text-xs">{product.code}</p>
                    <p className="text-orange-500 font-bold">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Space */}
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200" className="w-full h-64 object-cover" alt="Event" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <h2 className="text-white text-2xl lg:text-3xl font-bold mb-2">Event Space</h2>
              <p className="text-gray-200 text-sm mb-4 max-w-md">Join exclusive events, webinars, and community gatherings.</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm w-fit transition-colors">Explore Events</button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: "fa-eye", label: "Total Views", value: "0", color: "blue" },
              { icon: "fa-coins", label: "Total Earned", value: `LKR ${user?.balance || 0}`, color: "green" },
              { icon: "fa-gift", label: "Rewards", value: user?.milestoneReward || "0", color: "purple" },
              { icon: "fa-fire", label: "Streak", value: "0 Days", color: "orange" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <i className={`fas ${stat.icon} text-${stat.color}-500`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                    <p className="text-white font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Recent Activity</h3>
              <button className="text-orange-500 text-sm hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-[#252525] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <i className="fas fa-check text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Account Created</p>
                  <p className="text-gray-500 text-xs">Welcome to {branding.siteName || 'ODEL ADS'}!</p>
                </div>
                <span className="text-gray-500 text-xs">Just now</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-[#252525] rounded-xl opacity-50">
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <i className="fas fa-clock text-zinc-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">No more activity</p>
                  <p className="text-gray-600 text-xs">Start watching ads to earn!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#1a1a1a] border-t border-zinc-800">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full" />
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xs italic">VISA</span>
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <div className="flex">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-blue-500 rounded-full -ml-1" />
                </div>
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-[8px]">Amex</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">{branding.copyrightText || `© 2026 ${branding.siteName || 'ODEL ADS'}. All rights reserved.`}</p>
          </div>
        </footer>
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-4">
              <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <i className="fas fa-times text-gray-600" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-center">
                  <img src={selectedProduct.image} className="max-h-64 object-contain" alt={selectedProduct.title} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">{selectedProduct.badge}</span>
                  <h2 className="text-gray-900 text-xl font-bold mb-2">{selectedProduct.title}</h2>
                  <p className="text-gray-500 text-sm mb-4">{selectedProduct.code}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-orange-500 text-2xl font-bold">{selectedProduct.price}</span>
                    {selectedProduct.oldPrice && <span className="text-gray-400 text-lg line-through">{selectedProduct.oldPrice}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4].map((s) => <i key={s} className="fas fa-star" />)}
                      <i className="fas fa-star-half-alt" />
                    </div>
                    <span className="text-gray-500 text-sm">(4.5 / 128 reviews)</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Size:</p>
                    <div className="flex gap-2">
                      {["S", "M", "L", "XL"].map((size) => (
                        <span key={size} className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm cursor-pointer hover:border-orange-500 ${size === "M" ? "border-2 border-orange-500 bg-orange-50" : "border-gray-300"}`}>{size}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors">
                      <i className="fas fa-shopping-cart mr-2" /> Add to Cart
                    </button>
                    <button className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:border-orange-500 transition-colors">
                      <i className="far fa-heart text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-gray-900 font-bold mb-2">Product Description</h3>
                <p className="text-gray-600 text-sm">Premium quality product with excellent craftsmanship. Perfect for everyday use with a modern design that suits any style.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg z-50 flex items-center justify-center hover:bg-orange-600 transition-all"
        >
          <i className="fas fa-chevron-up" />
        </button>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
