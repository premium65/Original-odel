import { useState, useEffect } from "react";
import {
  Save, Mail, Phone, MapPin, Globe, Facebook, Twitter,
  Instagram, Youtube, CreditCard, Plus, Trash2, Link,
  FileText, HelpCircle, Send, Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FooterLink {
  id: number;
  text: string;
  url: string;
  enabled: boolean;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  enabled: boolean;
}

export default function FooterSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [contact, setContact] = useState({
    phone: "+94 11 123 4567",
    email: "support@odelads.com",
    address: "123 Business Street, Colombo, Sri Lanka",
  });

  const [newsletter, setNewsletter] = useState({
    enabled: true,
    title: "Sign up for Newsletter",
    subtitle: "Get the latest updates and offers",
    buttonText: "Subscribe",
    placeholder: "Enter your email address",
  });

  const [copyright, setCopyright] = useState({
    text: "Copyright 2026 ODEL-ADS. All rights reserved.",
    year: "2026",
    companyName: "ODEL-ADS",
  });

  const [customerCare, setCustomerCare] = useState<FooterLink[]>([
    { id: 1, text: "Return & Refund", url: "/return-refund", enabled: true },
    { id: 2, text: "Contact Us", url: "/contact", enabled: true },
    { id: 3, text: "Service Payment", url: "/service-payment", enabled: true },
    { id: 4, text: "FAQs", url: "/faqs", enabled: true },
  ]);

  const [aboutLinks, setAboutLinks] = useState<FooterLink[]>([
    { id: 1, text: "About Us", url: "/about", enabled: true },
    { id: 2, text: "Careers", url: "/careers", enabled: true },
    { id: 3, text: "Blog", url: "/blog", enabled: true },
  ]);

  const [helpLinks, setHelpLinks] = useState<FooterLink[]>([
    { id: 1, text: "My Account", url: "/account", enabled: true },
    { id: 2, text: "My Orders", url: "/orders", enabled: true },
    { id: 3, text: "Terms Of Use", url: "/terms", enabled: true },
    { id: 4, text: "Privacy Policy", url: "/privacy", enabled: true },
  ]);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: 1, platform: "facebook", url: "https://facebook.com/odelads", enabled: true },
    { id: 2, platform: "twitter", url: "https://twitter.com/odelads", enabled: true },
    { id: 3, platform: "instagram", url: "https://instagram.com/odelads", enabled: true },
    { id: 4, platform: "youtube", url: "https://youtube.com/odelads", enabled: true },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "VISA", enabled: true },
    { id: 2, name: "MC", enabled: true },
    { id: 3, name: "AMEX", enabled: true },
  ]);

  const { data: contentData, isLoading } = useQuery({
    queryKey: ["admin-content", "footer-settings"],
    queryFn: () => api.getContent("footer-settings"),
  });

  useEffect(() => {
    if (contentData && contentData.length > 0) {
      try {
        const content = contentData[0];
        if (content.metadata) {
          const parsed = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
          if (parsed.contact) setContact(prev => ({ ...prev, ...parsed.contact }));
          if (parsed.newsletter) setNewsletter(prev => ({ ...prev, ...parsed.newsletter }));
          if (parsed.copyright) setCopyright(prev => ({ ...prev, ...parsed.copyright }));
          if (parsed.customerCare) setCustomerCare(parsed.customerCare);
          if (parsed.aboutLinks) setAboutLinks(parsed.aboutLinks);
          if (parsed.helpLinks) setHelpLinks(parsed.helpLinks);
          if (parsed.socialLinks) setSocialLinks(parsed.socialLinks);
          if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods);
        }
      } catch (e) {
        console.error("Failed to parse footer settings:", e);
      }
    }
  }, [contentData]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateContent("footer-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "footer-settings"] });
      toast({ title: "Footer settings saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      section: "main",
      title: "Footer Settings",
      content: "",
      metadata: JSON.stringify({ contact, newsletter, copyright, customerCare, aboutLinks, helpLinks, socialLinks, paymentMethods }),
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return <Facebook className="h-5 w-5" />;
      case "twitter": return <Twitter className="h-5 w-5" />;
      case "instagram": return <Instagram className="h-5 w-5" />;
      case "youtube": return <Youtube className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const addLink = (section: string) => {
    const newLink = { id: Date.now(), text: "New Link", url: "/", enabled: true };
    switch (section) {
      case "customer": setCustomerCare([...customerCare, newLink]); break;
      case "about": setAboutLinks([...aboutLinks, newLink]); break;
      case "help": setHelpLinks([...helpLinks, newLink]); break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6b7280]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Footer Settings</h1>
            <p className="text-[#9ca3af]">Configure footer content and contact information</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={mutation.isPending} className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#10b981]" /> Contact Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <input type="text" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </label>
                <input type="email" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </label>
                <textarea value={contact.address} onChange={(e) => setContact({...contact, address: e.target.value})} rows={2} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981] resize-none" />
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Send className="h-5 w-5 text-[#f59e0b]" /> Newsletter Section
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9ca3af]">Enable Newsletter</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={newsletter.enabled} onChange={(e) => setNewsletter({...newsletter, enabled: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Title</label>
                <input type="text" value={newsletter.title} onChange={(e) => setNewsletter({...newsletter, title: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Subtitle</label>
                <input type="text" value={newsletter.subtitle} onChange={(e) => setNewsletter({...newsletter, subtitle: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Placeholder</label>
                  <input type="text" value={newsletter.placeholder} onChange={(e) => setNewsletter({...newsletter, placeholder: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Button Text</label>
                  <input type="text" value={newsletter.buttonText} onChange={(e) => setNewsletter({...newsletter, buttonText: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#3b82f6]" /> Social Media Links
              </h3>
              <button onClick={() => setSocialLinks([...socialLinks, { id: Date.now(), platform: "facebook", url: "", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {socialLinks.map((social) => (
                <div key={social.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2a3a4d] flex items-center justify-center text-[#9ca3af]">
                    {getSocialIcon(social.platform)}
                  </div>
                  <select value={social.platform} onChange={(e) => setSocialLinks(socialLinks.map(s => s.id === social.id ? {...s, platform: e.target.value} : s))} className="px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none">
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                  </select>
                  <input type="url" value={social.url} onChange={(e) => setSocialLinks(socialLinks.map(s => s.id === social.id ? {...s, url: e.target.value} : s))} placeholder="https://..." className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={social.enabled} onChange={(e) => setSocialLinks(socialLinks.map(s => s.id === social.id ? {...s, enabled: e.target.checked} : s))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                  <button onClick={() => setSocialLinks(socialLinks.filter(s => s.id !== social.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#8b5cf6]" /> Payment Methods
              </h3>
              <button onClick={() => setPaymentMethods([...paymentMethods, { id: Date.now(), name: "NEW", enabled: true }])} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center gap-2 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                    <input type="text" value={method.name} onChange={(e) => setPaymentMethods(paymentMethods.map(m => m.id === method.id ? {...m, name: e.target.value} : m))} className="w-20 px-2 py-1 bg-[#1a2332] border border-[#2a3a4d] rounded text-white text-sm text-center outline-none" />
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={method.enabled} onChange={(e) => setPaymentMethods(paymentMethods.map(m => m.id === method.id ? {...m, enabled: e.target.checked} : m))} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                    <button onClick={() => setPaymentMethods(paymentMethods.filter(m => m.id !== method.id))} className="w-6 h-6 bg-[#ef4444]/20 text-[#ef4444] rounded flex items-center justify-center hover:bg-[#ef4444]/30">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#0f1419] rounded-xl border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#9ca3af] text-sm">We Accept:</span>
                  {paymentMethods.filter(m => m.enabled).map((method) => (
                    <span key={method.id} className="px-3 py-1 border border-[#2a3a4d] rounded text-white text-sm font-medium">{method.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Care Links */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#f59e0b]" /> Customer Care
              </h3>
              <button onClick={() => addLink("customer")} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {customerCare.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <Link className="h-4 w-4 text-[#6b7280]" />
                  <input type="text" value={link.text} onChange={(e) => setCustomerCare(customerCare.map(l => l.id === link.id ? {...l, text: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="Link text" />
                  <input type="text" value={link.url} onChange={(e) => setCustomerCare(customerCare.map(l => l.id === link.id ? {...l, url: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" placeholder="/url" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={link.enabled} onChange={(e) => setCustomerCare(customerCare.map(l => l.id === link.id ? {...l, enabled: e.target.checked} : l))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                  <button onClick={() => setCustomerCare(customerCare.filter(l => l.id !== link.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Get To Know Us Links */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#10b981]" /> Get To Know Us
              </h3>
              <button onClick={() => addLink("about")} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {aboutLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <Link className="h-4 w-4 text-[#6b7280]" />
                  <input type="text" value={link.text} onChange={(e) => setAboutLinks(aboutLinks.map(l => l.id === link.id ? {...l, text: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <input type="text" value={link.url} onChange={(e) => setAboutLinks(aboutLinks.map(l => l.id === link.id ? {...l, url: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={link.enabled} onChange={(e) => setAboutLinks(aboutLinks.map(l => l.id === link.id ? {...l, enabled: e.target.checked} : l))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                  <button onClick={() => setAboutLinks(aboutLinks.filter(l => l.id !== link.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Let Us Help You Links */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#3b82f6]" /> Let Us Help You
              </h3>
              <button onClick={() => addLink("help")} className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] text-sm rounded-lg flex items-center gap-1 hover:bg-[#10b981]/30">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {helpLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl">
                  <Link className="h-4 w-4 text-[#6b7280]" />
                  <input type="text" value={link.text} onChange={(e) => setHelpLinks(helpLinks.map(l => l.id === link.id ? {...l, text: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <input type="text" value={link.url} onChange={(e) => setHelpLinks(helpLinks.map(l => l.id === link.id ? {...l, url: e.target.value} : l))} className="flex-1 px-3 py-2 bg-[#1a2332] border border-[#2a3a4d] rounded-lg text-white text-sm outline-none" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={link.enabled} onChange={(e) => setHelpLinks(helpLinks.map(l => l.id === link.id ? {...l, enabled: e.target.checked} : l))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a3a4d] peer-checked:bg-[#10b981] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                  <button onClick={() => setHelpLinks(helpLinks.filter(l => l.id !== link.id))} className="w-8 h-8 bg-[#ef4444]/20 text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
            <div className="px-6 py-4 border-b border-[#2a3a4d]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#6b7280]" /> Copyright
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Year</label>
                  <input type="text" value={copyright.year} onChange={(e) => setCopyright({...copyright, year: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Company Name</label>
                  <input type="text" value={copyright.companyName} onChange={(e) => setCopyright({...copyright, companyName: e.target.value})} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none" />
                </div>
              </div>
              <div className="bg-[#0f1419] rounded-xl p-4 border border-[#2a3a4d]">
                <p className="text-[#6b7280] text-xs mb-2">Preview:</p>
                <p className="text-[#9ca3af] text-sm">Copyright {copyright.year} {copyright.companyName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
