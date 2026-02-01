import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Megaphone, Plus, Edit, Trash2, Save, X, Upload, Image, 
  Tag, CheckCircle, MousePointer, Settings, Eye, List,
  ShoppingCart, ArrowRight, ExternalLink, Play, Download
} from "lucide-react";

interface Ad {
  id: number;
  title: string;
  description: string;
  image: string;
  currency: string;
  price: number;
  priceColor: string;
  features: string[];
  buttonText: string;
  buttonIcon: string;
  buttonUrl: string;
  isActive: boolean;
  showOnDashboard: boolean;
  displayOrder: number;
}

const defaultAd: Omit<Ad, 'id'> = {
  title: "",
  description: "",
  image: "",
  currency: "LKR",
  price: 0,
  priceColor: "#f59e0b",
  features: [""],
  buttonText: "Add to Cart",
  buttonIcon: "shopping-cart",
  buttonUrl: "",
  isActive: true,
  showOnDashboard: true,
  displayOrder: 1
};

const sampleAds: Ad[] = [
  {
    id: 1,
    title: "Exclusive Survey Offer",
    description: "Complete a simple survey to earn rewards.",
    image: "",
    currency: "LKR",
    price: 7053.75,
    priceColor: "#f59e0b",
    features: ["Cash on Delivery", "Easy Exchange & Refund Policy", "Island Wide Delivery"],
    buttonText: "Add to Cart",
    buttonIcon: "shopping-cart",
    buttonUrl: "",
    isActive: true,
    showOnDashboard: true,
    displayOrder: 1
  },
  {
    id: 2,
    title: "Premium Membership",
    description: "Get exclusive access to premium features.",
    image: "",
    currency: "LKR",
    price: 4999.00,
    priceColor: "#10b981",
    features: ["Unlimited Access", "Priority Support", "Bonus Rewards"],
    buttonText: "Subscribe Now",
    buttonIcon: "arrow-right",
    buttonUrl: "",
    isActive: true,
    showOnDashboard: true,
    displayOrder: 2
  }
];

const iconOptions = [
  { value: "shopping-cart", label: "🛒 Shopping Cart", icon: ShoppingCart },
  { value: "arrow-right", label: "➡️ Arrow Right", icon: ArrowRight },
  { value: "external-link", label: "🔗 External Link", icon: ExternalLink },
  { value: "play", label: "▶️ Play", icon: Play },
  { value: "download", label: "⬇️ Download", icon: Download },
  { value: "none", label: "No Icon", icon: null },
];

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>(sampleAds);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Ad, 'id'>>(defaultAd);

  useEffect(() => {
    if (ads.length > 0 && !currentAd) {
      selectAd(ads[0]);
    }
  }, []);

  const selectAd = (ad: Ad) => {
    setCurrentAd(ad);
    setIsCreating(false);
    setFormData({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      currency: ad.currency,
      price: ad.price,
      priceColor: ad.priceColor,
      features: ad.features.length > 0 ? ad.features : [""],
      buttonText: ad.buttonText,
      buttonIcon: ad.buttonIcon,
      buttonUrl: ad.buttonUrl,
      isActive: ad.isActive,
      showOnDashboard: ad.showOnDashboard,
      displayOrder: ad.displayOrder
    });
  };

  const createNewAd = () => {
    setCurrentAd(null);
    setIsCreating(true);
    setFormData({
      ...defaultAd,
      displayOrder: ads.length + 1,
      features: [""]
    });
  };

  const saveAd = () => {
    if (!formData.title.trim()) {
      alert("Please enter an ad title");
      return;
    }
    if (formData.price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const cleanedFeatures = formData.features.filter(f => f.trim() !== "");

    if (isCreating) {
      const newAd: Ad = {
        ...formData,
        id: Date.now(),
        features: cleanedFeatures.length > 0 ? cleanedFeatures : []
      };
      setAds([...ads, newAd]);
      setCurrentAd(newAd);
      setIsCreating(false);
    } else if (currentAd) {
      const updatedAds = ads.map(ad => 
        ad.id === currentAd.id 
          ? { ...ad, ...formData, features: cleanedFeatures }
          : ad
      );
      setAds(updatedAds);
      setCurrentAd({ ...currentAd, ...formData, features: cleanedFeatures });
    }
    alert("Ad saved successfully!");
  };

  const deleteAd = (id: number) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    const filtered = ads.filter(ad => ad.id !== id);
    setAds(filtered);
    if (currentAd?.id === id) {
      if (filtered.length > 0) {
        selectAd(filtered[0]);
      } else {
        createNewAd();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, image: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const getIconComponent = (iconValue: string) => {
    const option = iconOptions.find(o => o.value === iconValue);
    if (option?.icon) {
      const IconComponent = option.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Ads</h1>
            <p className="text-[#9ca3af]">Create and manage advertisement cards</p>
          </div>
        </div>
        <button 
          onClick={createNewAd}
          className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Plus className="h-5 w-5" /> Add New Ad
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        {/* Left Column: List + Form */}
        <div className="space-y-6">
          {/* Ads List */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <List className="h-5 w-5 text-[#3b82f6]" /> All Ads
              </h3>
              <span className="text-[#6b7280] text-sm">Total: {ads.length} ads</span>
            </div>
            <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
              {ads.length === 0 ? (
                <div className="text-center py-10 text-[#6b7280]">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No ads yet. Click "Add New Ad" to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ads.map(ad => (
                    <div 
                      key={ad.id}
                      onClick={() => selectAd(ad)}
                      className={`flex gap-4 p-4 bg-[#0f1419] border rounded-xl cursor-pointer transition-all ${
                        currentAd?.id === ad.id 
                          ? "border-[#10b981] bg-[#10b981]/5" 
                          : "border-[#2a3a4d] hover:border-[#3b82f6]"
                      }`}
                    >
                      <div className="w-20 h-20 bg-[#2a3a4d] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {ad.image ? (
                          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 text-[#6b7280]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">{ad.title}</h4>
                        <p className="text-[#6b7280] text-xs truncate mb-2">{ad.description}</p>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm" style={{ color: ad.priceColor }}>
                            {ad.currency} {ad.price.toLocaleString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ad.isActive 
                              ? "bg-[#10b981]/20 text-[#10b981]" 
                              : "bg-[#ef4444]/20 text-[#ef4444]"
                          }`}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); selectAd(ad); }}
                          className="w-8 h-8 bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg flex items-center justify-center hover:bg-[#3b82f6]/30 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteAd(ad.id); }}
                          className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#f59e0b]" /> {isCreating ? "Create New Ad" : "Edit Ad"}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => currentAd ? selectAd(currentAd) : createNewAd()}
                  className="px-4 py-2 bg-transparent border border-[#2a3a4d] text-[#9ca3af] text-sm font-medium rounded-lg hover:border-[#6b7280] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveAd}
                  className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4 text-[#f59e0b]" /> Ad Image
                </h4>
                <div 
                  onClick={() => !formData.image && document.getElementById('imageInput')?.click()}
                  className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                    formData.image 
                      ? "border-[#2a3a4d] p-0" 
                      : "border-[#2a3a4d] hover:border-[#3b82f6] p-8 text-center"
                  }`}
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-[#ef4444] text-white rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); document.getElementById('imageInput')?.click(); }}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#3b82f6] text-white text-xs font-medium rounded-lg flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" /> Change
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-[#6b7280] mx-auto mb-3" />
                      <p className="text-[#9ca3af] text-sm">Click to upload or drag and drop</p>
                      <p className="text-[#6b7280] text-xs mt-1">PNG, JPG, GIF (max 5MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="imageInput" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#f59e0b]" /> Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Ad Title *</label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Exclusive Survey Offer"
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Complete a simple survey to earn rewards."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#f59e0b]" /> Pricing
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Currency</label>
                    <select 
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                    >
                      <option value="LKR">LKR (Sri Lankan Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Price *</label>
                    <input 
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="7053.75"
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-[#9ca3af] mb-2">Price Color</label>
                  <div className="flex gap-3">
                    <input 
                      type="color"
                      value={formData.priceColor}
                      onChange={(e) => setFormData({ ...formData, priceColor: e.target.value })}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input 
                      type="text"
                      value={formData.priceColor}
                      onChange={(e) => setFormData({ ...formData, priceColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#f59e0b]" /> Features (Checkmarks)
                </h4>
                <div className="bg-[#0f1419] border border-[#2a3a4d] rounded-xl p-4 space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#10b981] flex-shrink-0" />
                      <input 
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature..."
                        className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none focus:border-[#10b981]"
                      />
                      <button 
                        onClick={() => removeFeature(index)}
                        className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addFeature}
                    className="w-full py-2.5 border border-dashed border-[#10b981] rounded-lg text-[#10b981] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#10b981]/10 transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add Feature
                  </button>
                </div>
              </div>

              {/* Button Settings */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-[#f59e0b]" /> Button Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Button Text</label>
                    <input 
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Add to Cart"
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9ca3af] mb-2">Button Icon</label>
                    <select 
                      value={formData.buttonIcon}
                      onChange={(e) => setFormData({ ...formData, buttonIcon: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-[#9ca3af] mb-2">Button Link URL</label>
                  <input 
                    type="url"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="https://example.com/offer"
                    className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#f59e0b]" /> Settings
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-[#2a3a4d]">
                    <span className="text-[#9ca3af] text-sm">Ad is Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#2a3a4d]">
                    <span className="text-[#9ca3af] text-sm">Show on Dashboard</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.showOnDashboard}
                        onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="pt-3">
                    <label className="block text-xs text-[#9ca3af] mb-2">Display Order</label>
                    <input 
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white text-sm outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={saveAd}
                  className="flex-1 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <Save className="h-5 w-5" /> Save Changes
                </button>
                <button 
                  onClick={() => currentAd ? selectAd(currentAd) : createNewAd()}
                  className="px-6 py-3 bg-transparent border border-[#2a3a4d] text-[#9ca3af] font-medium rounded-xl hover:border-[#6b7280] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="xl:sticky xl:top-8 h-fit">
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#8b5cf6]" /> Live Preview
              </h3>
            </div>
          </div>

          {/* Ad Preview Card */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0f1419] border-b border-[#2a3a4d]">
              <span className="text-[#9ca3af] text-sm flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#f59e0b]" />
                {formData.title || "Ad Title"}
              </span>
              <button className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center text-[#9ca3af]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Image */}
            <div className="w-full h-48 bg-[#0f1419] flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-[#6b7280]">
                  <Image className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Ad Image</p>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-5">
              <h2 className="text-xl font-bold italic text-white mb-2">
                {formData.title || "Ad Title"}
              </h2>
              <p className="text-[#9ca3af] text-sm mb-4">
                {formData.description || "Ad description goes here."}
              </p>

              {/* Features */}
              {formData.features.filter(f => f.trim()).length > 0 && (
                <div className="space-y-2 mb-5">
                  {formData.features.filter(f => f.trim()).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#d1d5db] text-sm">
                      <CheckCircle className="h-5 w-5 text-[#10b981] flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              <div 
                className="text-2xl font-bold mb-5"
                style={{ color: formData.priceColor }}
              >
                {formData.currency} {formData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Button */}
              <button className="w-full py-3.5 bg-transparent border border-[#2a3a4d] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all">
                {getIconComponent(formData.buttonIcon)}
                {formData.buttonText || "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
