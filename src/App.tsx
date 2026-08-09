/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Camera, 
  Image as ImageIcon, 
  ShoppingCart, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Trash2, 
  User, 
  MapPin, 
  Smartphone, 
  Package, 
  Sparkles,
  Lock,
  Unlock,
  ArrowRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

interface Order {
  id: string;
  name: string;
  mobile: string;
  address: string;
  quantity: string;
  packetDetails: string;
  photoUrl: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'admin'>('store');
  const [packetDetails, setPacketDetails] = useState('₹6.5 प्रति पैकेट - शुद्ध घी और कपास बत्ती');
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('gol_jyoti_photo') || '';
    } catch {
      return '';
    }
  });
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('gol_jyoti_logo') || '';
    } catch {
      return '';
    }
  });

  // Admin PIN Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('gol_jyoti_admin_pin') || '1234';
    } catch {
      return '1234';
    }
  });
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  
  // Order Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderWhatsAppUrl, setLastOrderWhatsAppUrl] = useState('');

  // Admin Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gol_jyoti_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out demo orders
        const filtered = parsed.filter((o: Order) => !o.name.includes('राहुल शर्मा') && !o.name.includes('Rahul'));
        return filtered;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gol_jyoti_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('gol_jyoti_logo', logoUrl);
    } catch {
      // ignore
    }
  }, [logoUrl]);

  useEffect(() => {
    try {
      localStorage.setItem('gol_jyoti_photo', photoUrl);
    } catch {
      // ignore
    }
  }, [photoUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setLogoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !address.trim() || !quantity.trim()) {
      alert('कृपया नाम, मोबाइल, पता और पैकेट की मात्रा भरें।');
      return;
    }

    const totalPrice = Number(quantity) * 6.5;

    const newOrder: Order = {
      id: Date.now().toString(),
      name,
      mobile,
      address,
      quantity,
      packetDetails,
      photoUrl,
      date: new Date().toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'pending'
    };

    setOrders([newOrder, ...orders]);

    // Construct WhatsApp message text for store owner (7827368198)
    const waText = `🛒 *नया ऑर्डर - गोल ज्योति स्टोर*\n\n👤 नाम: ${name}\n📞 मोबाइल: ${mobile}\n📍 पता: ${address}\n📦 पैकेट: ${quantity}\n💰 कुल कीमत: ₹${totalPrice.toLocaleString('en-IN')}\n📝 पैकेट विवरण: ${packetDetails || 'लागू नहीं'}\n⏰ समय: ${newOrder.date}`;
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/917827368198?text=${encodedText}`;
    setLastOrderWhatsAppUrl(waUrl);

    setOrderSuccess(true);
    setName('');
    setMobile('');
    setAddress('');
    setQuantity('');
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('क्या आप इस ऑर्डर को हटाना चाहते हैं?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, status: 'accepted' | 'rejected') => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === adminPin) {
      setIsAdminUnlocked(true);
      setEnteredPin('');
    } else {
      alert('गलत पिन (Wrong PIN)! कृपया सही पिन दर्ज करें। (डिफ़ॉल्ट पिन: 1234)');
      setEnteredPin('');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      setAdminPin(newPin);
      localStorage.setItem('gol_jyoti_admin_pin', newPin);
      setIsChangingPin(false);
      setNewPin('');
      alert('प्राइवेट पिन सफलतापूर्वक बदल दिया गया है!');
    } else {
      alert('पिन कम से कम 4 अंकों का होना चाहिए।');
    }
  };

  const WHATSAPP_NUMBER = '7827368198';

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900 pb-16">
      {/* Top Auspicious Header Bar */}
      <header className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                title="लोगो बदलने के लिए यहाँ क्लिक करें"
                className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner overflow-hidden border-2 border-amber-300 hover:border-white transition-all cursor-pointer"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Flame className="w-6 h-6 fill-amber-500 animate-pulse text-orange-600" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full">
                  <Camera className="w-4 h-4" />
                </div>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                ref={logoFileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
              />
              {logoUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUrl('');
                  }}
                  title="लोगो हटाएं"
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow hover:bg-red-700"
                >
                  ×
                </button>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide flex items-center gap-1.5">
                गोल ज्योति स्टोर <Sparkles className="w-4 h-4 text-amber-200" />
              </h1>
              <p className="text-xs text-amber-100 font-medium">सृष्टि ज्योति बाथी बिजनेस</p>
            </div>
          </div>

          <div className="flex items-center bg-amber-900/40 rounded-full p-1 border border-amber-500/30">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'store'
                  ? 'bg-white text-amber-950 shadow-sm font-semibold'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              स्टोर
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-950 shadow-sm font-semibold'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" /> एडमिन ({orders.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-5">
        {activeTab === 'store' ? (
          <div className="space-y-6">

            {/* Product Photo View (Visible to Customers cleanly without camera/gallery clutter) */}
            {photoUrl && (
              <div className="bg-white rounded-3xl p-4 shadow-md border border-amber-200/70 overflow-hidden">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> बाथी / ज्योति फोटो (उत्पाद)
                  </h2>
                </div>
                <div className="relative aspect-video sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shadow-inner">
                  <img 
                    src={photoUrl} 
                    alt="ज्योति बाथी उत्पाद" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Packet Information Section */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-amber-200/70">
              <label className="block text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" /> पैकेट की जानकारी (विवरण)
              </label>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 text-stone-700 text-sm font-medium whitespace-pre-wrap">
                {packetDetails || '₹6.5 प्रति पैकेट - उच्च गुणवत्ता वाली शुद्ध गोल ज्योति बाथी।'}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                * ग्राहक इस विवरण और फोटो को देखकर नीचे फॉर्म भरकर आसानी से आर्डर कर सकते हैं।
              </p>
            </div>

            {/* Order Now Section / Form */}
            <div id="order-section" className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-200" /> 🛒 ORDER NOW (ऑर्डर करें)
                </h3>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium text-amber-100">
                  सृष्टि ज्योति बाथी
                </span>
              </div>

              {orderSuccess ? (
                <div className="bg-white text-stone-800 rounded-2xl p-6 text-center space-y-4 shadow-lg animate-fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-800">ऑर्डर सफलतापूर्वक दर्ज हो गया!</h4>
                  <p className="text-xs text-stone-600">
                    आपका ऑर्डर सुरक्षित रूप से एडमिन के पास पहुँच गया है। आप चाहें तो सीधे WhatsApp पर भी भेज सकते हैं।
                  </p>
                  
                  <div className="pt-2 flex flex-col gap-2">
                    {lastOrderWhatsAppUrl && (
                      <a 
                        href={lastOrderWhatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>WhatsApp पर ऑर्डर भेजें</span>
                      </a>
                    )}
                    <button
                      onClick={() => setOrderSuccess(false)}
                      className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs transition-all cursor-pointer"
                    >
                      नया ऑर्डर दें
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> नाम:
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="पूरा नाम दर्ज करें"
                      required
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-amber-200/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> मोबाइल:
                    </label>
                    <input 
                      type="tel" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="मोबाइल नंबर (जैसे: 9876543210)"
                      required
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-amber-200/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> कितने पैकेट चाहिए?</span>
                      <span className="text-[11px] text-amber-200 font-normal">₹6.5 प्रति पैकेट</span>
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="पैकेट की संख्या डालें (जैसे: 100)"
                      required
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-amber-200/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
                    />

                    {/* Live Order Summary */}
                    {quantity && !isNaN(Number(quantity)) && Number(quantity) > 0 && (
                      <div className="mt-2.5 pt-2 bg-white/10 rounded-xl p-3 text-white flex justify-between items-center animate-fade-in border border-white/20">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">आपका ऑर्डर</div>
                          <div className="font-medium text-sm">पैकेट: <span className="font-bold text-amber-300">{quantity}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">कुल कीमत</div>
                          <div className="text-base font-extrabold text-emerald-300">
                            ₹{(Number(quantity) * 6.5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-100 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> पूरा पता:
                    </label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="घर का नंबर, गली, शहर, पिन कोड"
                      rows={2}
                      required
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-amber-200/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 px-6 bg-white text-amber-900 hover:bg-amber-50 active:scale-98 font-bold rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>[ CONFIRM ORDER ]</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>

            {/* Footer Support Info */}
            <div className="bg-white rounded-2xl p-4 text-center border border-amber-200/70 shadow-sm space-y-2">
              <p className="text-xs text-stone-500 font-medium">
                📞 Call | WhatsApp सहायता के लिए संपर्क करें:
              </p>
              <div className="flex items-center justify-center gap-4">
                <a 
                  href={`tel:${WHATSAPP_NUMBER}`}
                  className="inline-flex items-center gap-1.5 text-amber-800 font-bold text-sm bg-amber-50 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-600" /> {WHATSAPP_NUMBER}
                </a>
                <a 
                  href={`https://wa.me/91${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp
                </a>
              </div>
            </div>

          </div>
        ) : (
          /* Admin Panel View with PIN Protection */
          <div className="space-y-4">
            {!isAdminUnlocked ? (
              <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-200 text-center space-y-6 max-w-md mx-auto my-8">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-amber-900">प्राइवेट एडमिन लॉक (Private Access)</h2>
                  <p className="text-xs text-stone-600">
                    यह सुनिश्चित करता है कि केवल आप और आर्डर करने वाले ग्राहक ही आर्डर देख सकें। कृपया 4-अंकों का पिन (PIN) दर्ज करें।
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium bg-amber-50 py-1 px-2 rounded-lg inline-block mt-1">
                    डिफ़ॉल्ट पिन: <code className="font-bold">1234</code>
                  </p>
                </div>

                <form onSubmit={handleAdminUnlock} className="space-y-4">
                  <input 
                    type="password" 
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="पिन दर्ज करें (उदा: 1234)"
                    className="w-full text-center tracking-widest text-lg font-bold bg-amber-50/50 border border-amber-300 rounded-xl px-4 py-3 text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full py-3 px-6 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>एडमिन पैनल खोलें</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Controls Box for Uploading Product Photo & Editing Packet Details */}
                <div className="bg-white rounded-3xl p-5 shadow-md border border-amber-200/70 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                    <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" /> 📷 उत्पाद फोटो और विवरण (एडमिन कंट्रोल)
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsChangingPin(!isChangingPin)}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" /> पिन बदलें
                      </button>
                      <button
                        onClick={() => setIsAdminUnlocked(false)}
                        className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3" /> लॉक करें
                      </button>
                    </div>
                  </div>

                  {/* Change PIN Modal Form */}
                  {isChangingPin && (
                    <form onSubmit={handleSaveNewPin} className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                      <h3 className="text-xs font-bold text-amber-900">नया प्राइवेट पिन सेट करें:</h3>
                      <input 
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="कम से कम 4 अंक"
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                      <div className="flex gap-2">
                        <button 
                          type="submit"
                          className="flex-1 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs"
                        >
                          सेव करें
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsChangingPin(false)}
                          className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-xl text-xs"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Product Photo Upload Section for Admin */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      बाथी / ज्योति उत्पाद फोटो (कैमरा या गैलरी से अपलोड करें):
                    </label>
                    
                    <div className="relative aspect-video sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center group shadow-inner mb-3">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt="उत्पाद फोटो" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Flame className="w-8 h-8 text-amber-400 mx-auto mb-1 animate-bounce" />
                          <p className="text-xs text-amber-800 font-medium">कोई फोटो अपलोड नहीं की गई है</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>[ Camera से फोटो लें ]</span>
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        ref={cameraInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>[ Gallery से चुनें ]</span>
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </div>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="mt-2 w-full text-xs bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> वर्तमान उत्पाद फोटो हटाएं
                      </button>
                    )}
                  </div>

                  {/* Packet Details Editor for Admin */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      पैकेट की जानकारी / रेट एडिट करें:
                    </label>
                    <textarea
                      value={packetDetails}
                      onChange={(e) => setPacketDetails(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-amber-300 p-3 text-stone-800 bg-amber-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs shadow-inner"
                      placeholder="पैकेट विवरण यहाँ लिखें..."
                    />
                  </div>
                </div>

                {/* Orders Management List */}
                <div className="bg-white rounded-3xl p-5 shadow-md border border-amber-200/70">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
                    <div>
                      <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-600" /> ग्राहक ऑर्डर सूची (Customer Orders)
                      </h2>
                      <p className="text-xs text-stone-500">कुल प्राप्त ऑर्डर: {orders.length}</p>
                    </div>
                    {orders.length > 0 && (
                      <button 
                        onClick={() => {
                          if (window.confirm('क्या आप सभी ऑर्डर साफ़ करना चाहते हैं?')) {
                            setOrders([]);
                          }
                        }}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        सभी साफ़ करें
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">अभी तक कोई ऑर्डर प्राप्त नहीं हुआ है।</p>
                      <p className="text-xs text-stone-400 mt-1">जब ग्राहक 'CONFIRM ORDER' दबाएंगे, तब आर्डर यहाँ दिखाई देंगे।</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 shadow-sm space-y-3 relative group hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-200/60 overflow-hidden shrink-0">
                                {order.photoUrl ? (
                                  <img src={order.photoUrl} alt="Order" className="w-full h-full object-cover" />
                                ) : (
                                  <Flame className="w-5 h-5 text-amber-700 m-2.5" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-stone-900 text-sm">{order.name}</h3>
                                <p className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                                  <Smartphone className="w-3 h-3" /> {order.mobile}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-stone-500 bg-white px-2 py-0.5 rounded-md border border-amber-100">
                                {order.date}
                              </span>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="block mt-1 text-red-500 hover:text-red-700 text-xs ml-auto cursor-pointer"
                                title="ऑर्डर हटाएं"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-amber-100">
                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-100">
                              <span className="font-semibold text-stone-700">ऑर्डर स्थिति (Status):</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                order.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status === 'accepted' ? '✓ स्वीकृत (Accepted)' :
                                 order.status === 'rejected' ? '✗ अस्वीकृत (Rejected)' :
                                 '⏳ लंबित (Pending)'}
                              </span>
                            </div>
                            <p><strong className="text-stone-700">पूरा पता:</strong> {order.address}</p>
                            <p><strong className="text-stone-700">कितने पैकेट:</strong> <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{order.quantity}</span></p>
                            <p><strong className="text-stone-700">कुल कीमत:</strong> <span className="text-emerald-700 font-bold">₹{(Number(order.quantity) * 6.5).toLocaleString('en-IN')}</span></p>
                            {order.packetDetails && <p><strong className="text-stone-700">विवरण:</strong> {order.packetDetails}</p>}
                          </div>

                          {/* Accept / Reject Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'accepted')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                order.status === 'accepted' 
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              ✓ स्वीकार करें (Accept)
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                order.status === 'rejected' 
                                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400' 
                                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              ✗ अस्वीकृत करें (Reject)
                            </button>
                          </div>

                          {/* Call & WhatsApp Action Buttons for Admin to Contact Customer */}
                          <div className="flex items-center gap-2 pt-1">
                            <a 
                              href={`tel:${order.mobile}`}
                              className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> 📞 Call ({order.mobile})
                            </a>
                            <a 
                              href={`https://wa.me/91${order.mobile.replace(/\D/g, '')}?text=नमस्ते%20${encodeURIComponent(order.name)},%20गोल%20ज्योति%20स्टोर%20से%20आपके%20${order.quantity}%20पैकेट%20ऑर्डर%20के%20संबंध%20में:`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp ग्राहक
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
