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
  KeyRound,
  Navigation,
  ExternalLink,
  CheckCheck,
  XCircle
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
  status: 'pending' | 'accepted' | 'delivered' | 'rejected';
  latitude?: number | null;
  longitude?: number | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'admin'>('store');
  
  // Persistent Packet Details
  const [packetDetails, setPacketDetails] = useState<string>(() => {
    try {
      return localStorage.getItem('gol_jyoti_packet_details') || '₹6.5 प्रति पैकेट - शुद्ध घी और कपास बत्ती (उच्च गुणवत्ता)';
    } catch {
      return '₹6.5 प्रति पैकेट - शुद्ध घी और कपास बत्ती (उच्च गुणवत्ता)';
    }
  });

  // Persistent Product Photos Gallery
  const [photos, setPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gol_jyoti_photos');
      if (saved) {
        return JSON.parse(saved);
      }
      const single = localStorage.getItem('gol_jyoti_photo');
      if (single) {
        return [single];
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Persistent Store Logo
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderWhatsAppUrl, setLastOrderWhatsAppUrl] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'accepted' | 'delivered' | 'rejected'>('all');
  const [mapModalOrder, setMapModalOrder] = useState<Order | null>(null);

  // Admin Orders State (Persistent)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gol_jyoti_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((o: Order) => !o.name.includes('राहुल शर्मा (Demo)'));
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
      localStorage.setItem('gol_jyoti_photos', JSON.stringify(photos));
    } catch {
      // ignore
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem('gol_jyoti_packet_details', packetDetails);
    } catch {
      // ignore
    }
  }, [packetDetails]);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotoList: string[] = [];
      let loadedCount = 0;
      const fileArray = Array.from(files) as File[];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPhotoList.push(reader.result as string);
          }
          loadedCount++;
          if (loadedCount === fileArray.length) {
            setPhotos(prev => [...newPhotoList, ...prev]);
          }
        };
        reader.readAsDataURL(file);
      });
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('आपका ब्राउज़र जियोलोकेशन समर्थित नहीं करता है।');
      return;
    }
    setIsGettingLocation(true);
    setLocationStatus('📍 GPS लोकेशन प्राप्त की जा रही है...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
        setLocationStatus('✅ GPS लोकेशन सफलतापूर्वक जुड़ गई!');
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationStatus('⚠️ लोकेशन प्राप्त करने में विफल। कृपया पता (Address) सही से भरें।');
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
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
      photoUrl: photos[0] || '',
      date: new Date().toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'pending',
      latitude,
      longitude
    };

    setOrders([newOrder, ...orders]);

    // Construct WhatsApp message text for store owner (7827368198)
    const locText = (latitude && longitude) ? `\n📍 Map Location: https://www.google.com/maps?q=${latitude},${longitude}` : '';
    const waText = `🛒 *नया ऑर्डर - गोल ज्योति स्टोर*\n\n👤 नाम: ${name}\n📞 मोबाइल: ${mobile}\n📍 पूरा पता: ${address}\n📦 पैकेट संख्या: ${quantity}\n💰 कुल कीमत: ₹${totalPrice.toLocaleString('en-IN')}${locText}\n📝 विवरण: ${packetDetails || 'लागू नहीं'}\n⏰ समय: ${newOrder.date}`;
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/917827368198?text=${encodedText}`;
    setLastOrderWhatsAppUrl(waUrl);

    setOrderSuccess(true);
    setName('');
    setMobile('');
    setAddress('');
    setQuantity('');
    setLatitude(null);
    setLongitude(null);
    setLocationStatus('');
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('क्या आप इस ऑर्डर को हटाना चाहते हैं?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, status: 'pending' | 'accepted' | 'delivered' | 'rejected') => {
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
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner overflow-hidden border-2 border-amber-300">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Flame className="w-6 h-6 fill-amber-500 animate-pulse text-orange-600" />
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 relative ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-950 shadow-sm font-semibold'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" /> एडमिन
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-5">
        {activeTab === 'store' ? (
          <div className="space-y-6">

            {/* Product Gallery Photos (All photos uploaded by admin displayed to customers) */}
            {photos.length > 0 && (
              <div className="bg-white rounded-3xl p-4 shadow-md border border-amber-200/75 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> बाथी / ज्योति उत्पाद गैलरी ({photos.length} फोटो)
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative aspect-video sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shadow-inner">
                      <img 
                        src={p} 
                        alt={`उत्पाद फोटो ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packet Information Section (Permanent for customers, not deleted) */}
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
                  <h4 className="text-lg font-bold text-emerald-800">✅ ऑर्डर सफलतापूर्वक सेव हो गया है!</h4>
                  <p className="text-xs text-stone-600">
                    आपका ऑर्डर सुरक्षित रूप से एडमिन पैनल में दर्ज कर लिया गया है। आप चाहें तो सीधे WhatsApp पर भी भेज सकते हैं।
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
                        <span>📱 WhatsApp पर Order भेजें (Optional)</span>
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
                      <User className="w-3.5 h-3.5" /> ग्राहक का नाम:
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
                      <Smartphone className="w-3.5 h-3.5" /> मोबाइल नंबर:
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
                      <MapPin className="w-3.5 h-3.5" /> पूरा पता (Address & City):
                    </label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="घर का नंबर, गली, शहर/इलाका, पिन कोड"
                      rows={2}
                      required
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-amber-200/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
                    />
                  </div>

                  {/* Geolocation Button */}
                  <div className="bg-white/10 rounded-2xl p-3.5 border border-white/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-amber-200" /> डिलीवरी लोकेशन (GPS):
                      </span>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isGettingLocation}
                        className="py-2 px-3.5 bg-white text-amber-900 hover:bg-amber-50 active:scale-98 font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>{isGettingLocation ? 'लोकेशन ले रहे हैं...' : '📍 मेरी Current Location भेजें'}</span>
                      </button>
                    </div>
                    {locationStatus && (
                      <p className={`text-xs font-medium ${latitude ? 'text-emerald-300' : 'text-amber-200'}`}>
                        {locationStatus} {latitude && longitude ? `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : ''}
                      </p>
                    )}
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

          </div>
        ) : (
          /* Admin Panel View (Direct access without PIN lock) */
          <div className="space-y-6">
                {/* Admin Controls Box for Uploading Product Photo & Editing Packet Details */}
                <div className="bg-white rounded-3xl p-5 shadow-md border border-amber-200/70 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                    <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" /> 📷 उत्पाद फोटो और विवरण (एडमिन कंट्रोल)
                    </h2>
                  </div>

                  {/* Product Photo Upload Section for Admin (Multiple Photos Supported) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      बाथी / ज्योति उत्पाद फोटो (जितनी चाहें उतनी फोटो अपलोड करें):
                    </label>

                    {/* Uploaded Photos Grid */}
                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        {photos.map((p, idx) => (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-amber-50 border border-amber-200 shadow-sm group">
                            <img src={p} alt={`फोटो ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('क्या आप इस फोटो को हटाना चाहते हैं?')) {
                                  setPhotos(photos.filter((_, i) => i !== idx));
                                }
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg shadow transition-colors cursor-pointer"
                              title="फोटो हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative aspect-video sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center group shadow-inner mb-3">
                        <div className="text-center p-4">
                          <Flame className="w-8 h-8 text-amber-400 mx-auto mb-1 animate-bounce" />
                          <p className="text-xs text-amber-800 font-medium">कोई फोटो अपलोड नहीं की गई है। नीचे बटन से कई फोटो जोड़ें।</p>
                        </div>
                      </div>
                    )}

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
                        onChange={handleImagesUpload} 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>[ Gallery से कई चुनें ]</span>
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        ref={fileInputRef} 
                        onChange={handleImagesUpload} 
                        className="hidden" 
                      />
                    </div>

                    {photos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('क्या आप सभी अपलोड की गई फोटो हटाना चाहते हैं?')) {
                            setPhotos([]);
                          }
                        }}
                        className="mt-2 w-full text-xs bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> सभी ({photos.length}) फोटो एक साथ हटाएं
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-amber-100 gap-3">
                    <div>
                      <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-600" /> ग्राहक ऑर्डर सूची (Admin Orders List)
                      </h2>
                      <p className="text-xs text-stone-500">कुल प्राप्त ऑर्डर: {orders.length}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {orders.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => {
                            if (window.confirm('⚠️ क्या आप ग्राहक सूची के सभी ऑर्डर हमेशा के लिए साफ़ (Delete All) करना चाहते हैं?')) {
                              setOrders([]);
                              localStorage.removeItem('gol_jyoti_orders');
                              setOrderFilter('all');
                            }
                          }}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 🗑️ सभी ग्राहक ऑर्डर साफ़ करें (Clear All)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  {orders.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
                      {[
                        { id: 'all', label: 'सभी (All)', count: orders.length },
                        { id: 'pending', label: 'नए (New)', count: orders.filter(o => o.status === 'pending').length },
                        { id: 'accepted', label: 'कंफर्म (Confirmed)', count: orders.filter(o => o.status === 'accepted').length },
                        { id: 'delivered', label: 'डिलीवर्ड (Delivered)', count: orders.filter(o => o.status === 'delivered').length },
                        { id: 'rejected', label: 'कैंसल (Cancelled)', count: orders.filter(o => o.status === 'rejected').length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setOrderFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            orderFilter === tab.id
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${orderFilter === tab.id ? 'bg-white/20 text-white' : 'bg-amber-200/70 text-amber-900'}`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">अभी तक कोई ऑर्डर प्राप्त नहीं हुआ है।</p>
                      <p className="text-xs text-stone-400 mt-1">जब ग्राहक 'CONFIRM ORDER' दबाएंगे, तब आर्डर यहाँ दिखाई देंगे।</p>
                    </div>
                  ) : orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 ? (
                    <div className="text-center py-10 text-stone-400 bg-amber-50/30 rounded-2xl border border-dashed border-amber-200">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium text-stone-600">इस सूची में कोई ऑर्डर नहीं है।</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).map((order) => (
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

                          <div className="text-xs space-y-1.5 bg-white p-3 rounded-xl border border-amber-100">
                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-100">
                              <span className="font-semibold text-stone-700">ऑर्डर स्थिति (Status):</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status === 'accepted' ? '🔵 Confirmed (स्वीकृत)' :
                                 order.status === 'delivered' ? '🟢 Delivered (डिलिवर्ड)' :
                                 order.status === 'rejected' ? '🔴 Cancelled (रद्द)' :
                                 '🟠 New (नया)'}
                              </span>
                            </div>
                            <p><strong className="text-stone-700">पूरा पता:</strong> {order.address}</p>
                            <p><strong className="text-stone-700">कितने पैकेट:</strong> <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{order.quantity}</span></p>
                            <p><strong className="text-stone-700">कुल कीमत:</strong> <span className="text-emerald-700 font-bold">₹{(Number(order.quantity) * 6.5).toLocaleString('en-IN')}</span></p>
                            
                            {/* Map Location Link and Interactive Map Modal Trigger */}
                            {order.address ? (
                              <div className="pt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setMapModalOrder(order)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                                >
                                  <MapPin className="w-4 h-4" /> 📍 मैप पर लोकेशन देखें (Map Location)
                                </button>
                                <a 
                                  href={`https://www.google.com/maps?q=${order.latitude && order.longitude ? `${order.latitude},${order.longitude}` : encodeURIComponent(order.address)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors"
                                  title="Google Maps में खोलें"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            ) : null}

                            {order.packetDetails && <p><strong className="text-stone-700">विवरण:</strong> {order.packetDetails}</p>}
                          </div>

                          {/* Order Status Update Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'accepted')}
                              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                order.status === 'accepted' 
                                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300' 
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              🔵 Confirmed
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                order.status === 'delivered' 
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              🟢 Delivered
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                order.status === 'rejected' 
                                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300' 
                                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              🔴 Cancelled
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
                            {(() => {
                              const cleanMobile = order.mobile.replace(/\D/g, '');
                              const msgText = `नमस्ते ${order.name}, गोल ज्योति स्टोर से आपके ${order.quantity} पैकेट ऑर्डर के संबंध में:`;
                              const customerWaUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msgText)}`;
                              return (
                                <a 
                                  href={customerWaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp ग्राहक
                                </a>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
        )}
      </main>

      {/* Interactive Map Modal for Admin */}
      {mapModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col max-h-[90vh]">
            <div className="bg-amber-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> ग्राहक की डिलीवरी लोकेशन - {mapModalOrder.name}
              </h3>
              <button 
                type="button"
                onClick={() => setMapModalOrder(null)}
                className="text-amber-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs space-y-1 text-stone-800">
                <p><strong>ग्राहक:</strong> {mapModalOrder.name} ({mapModalOrder.mobile})</p>
                <p><strong>पूरा पता:</strong> {mapModalOrder.address}</p>
                <p><strong>लोकेशन का प्रकार:</strong> {mapModalOrder.latitude && mapModalOrder.longitude ? 'GPS कोऑर्डिनेट्स' : 'दर्ज किया गया पता (Address)'}</p>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-amber-200 shadow-inner bg-stone-100 relative">
                <iframe
                  title="Customer Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${mapModalOrder.latitude && mapModalOrder.longitude ? `${mapModalOrder.latitude},${mapModalOrder.longitude}` : encodeURIComponent(mapModalOrder.address)}&z=15&output=embed`}
                  allowFullScreen
                />
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps?q=${mapModalOrder.latitude && mapModalOrder.longitude ? `${mapModalOrder.latitude},${mapModalOrder.longitude}` : encodeURIComponent(mapModalOrder.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <ExternalLink className="w-4 h-4" /> Google Maps App में खोलें
                </a>
                <button
                  type="button"
                  onClick={() => setMapModalOrder(null)}
                  className="py-2.5 px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
