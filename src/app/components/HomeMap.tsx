import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, User, MapPin, Dice5, Wallet, Eye, EyeOff, ChevronDown, Check, X,
  Navigation, Footprints, Bike, Car, Clock,
} from "lucide-react";
import { EateryDetail } from "./EateryDetail";
import { Navigator } from "./Navigator";
import { useStore, fmtRp } from "../store";
import { EATERIES_BY_CAMPUS } from "../data";
import { fetchEateriesFromSupabase } from "../supabaseData";
import confetti from "canvas-confetti";
import { NakamLogo } from "./Logo";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const createMarkerIcon = (isMine: boolean, emoji: string) => {
  return L.divIcon({
    className: '',
    html: isMine 
      ? `<div class="relative"><span class="absolute inset-0 -m-2 animate-ping rounded-full bg-emerald-400/40"></span><div class="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl shadow-xl">${emoji || '🍜'}</div><div class="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] text-white shadow" style="font-weight:700">TOKOMU</div></div>`
      : `<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#1a1f4d] text-white shadow-xl"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const userIcon = L.divIcon({
  className: '',
  html: `<div class="relative"><span class="absolute inset-0 -m-4 animate-ping rounded-full bg-blue-500/30"></span><span class="absolute inset-0 -m-2 rounded-full bg-blue-500/20"></span><div class="relative h-5 w-5 rounded-full border-[3px] border-white bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div><div class="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-500 px-2 py-0.5 text-[9px] text-white shadow" style="font-weight:700">KAMU</div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom || map.getZoom()); }, [center, zoom, map]);
  return null;
}

const FILTERS = ["⭐ Rating Tertinggi", "💸 Penyelamat Akhir Bulan", "🍚 Porsi Kuli", "🔌 Spot Nugas", "🅿️ Bebas Parkir"];
const CAMPUSES = [
  { code: "UMM", name: "Universitas Muhammadiyah Malang", students: "30k+" },
  { code: "UB", name: "Universitas Brawijaya", students: "60k+" },
  { code: "UM", name: "Universitas Negeri Malang", students: "25k+" },
];

export function HomeMap({
  onOpenProfile, onOpenWallet,
}: {
  onOpenProfile: () => void;
  onOpenWallet: () => void;
}) {
  const [selected, setSelected] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const [campusLoading, setCampusLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [routeTarget, setRouteTarget] = useState<any>(null);
  const [navTarget, setNavTarget] = useState<any>(null);
  const [userPos, setUserPos] = useState({ lat: -7.9213, lng: 112.5990 }); // Default UMM
  const { campus, setCampus, hideBalance, toggleHideBalance, budget, spent, merchant } = useStore();
  const [supabaseEateries, setSupabaseEateries] = useState<any[] | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Load eateries from Supabase when campus changes
  useEffect(() => {
    let cancelled = false;
    fetchEateriesFromSupabase(campus).then((data) => {
      if (!cancelled && data && data.length > 0) {
        setSupabaseEateries(data);
      } else if (!cancelled) {
        setSupabaseEateries(null); // fallback to hardcoded
      }
    });
    return () => { cancelled = true; };
  }, [campus]);

  const merchantEatery = merchant.onboarded && merchant.campus === campus ? {
    id: "merchant-self",
    name: merchant.name,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    walk: "kamu",
    dominance: 50,
    price: merchant.price,
    tags: ["Toko Kamu", merchant.status === "buka" ? "Buka" : merchant.status === "ramai" ? "Ramai" : "Tutup"],
    menu: merchant.menu.filter((m) => m.available).map((m) => ({ name: m.name, price: m.price, emoji: m.emoji })),
    gallery: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"],
    lat: merchant.lat || userPos.lat, lng: merchant.lng || userPos.lng, campus: merchant.campus || campus, filter: [],
    isMine: true,
    emoji: merchant.emoji,
  } : null;

  const eateriesSource = supabaseEateries || EATERIES_BY_CAMPUS[campus] || [];
  const baseList = [...eateriesSource, ...(merchantEatery ? [merchantEatery] : [])];
  
  let eateries = baseList.filter((e: any) => {
    if (!activeFilter) return true;
    if (activeFilter === "⭐ Rating Tertinggi") return true; // Keep all, just sort
    return (e.filter || []).includes(activeFilter);
  });

  if (activeFilter === "⭐ Rating Tertinggi") {
    eateries = eateries.sort((a: any, b: any) => b.dominance - a.dominance);
  }

  const triggerRandom = () => {
    setRolling(true);
    setShake(true);
    
    // Confetti effect
    const end = Date.now() + 1000;
    const colors = ['#FF6B1A', '#4285F4', '#10B981', '#F59E0B'];
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    setTimeout(() => setShake(false), 400);
    setTimeout(() => {
      setRolling(false);
      const list = EATERIES_BY_CAMPUS[campus];
      setSelected(list[Math.floor(Math.random() * list.length)]);
    }, 1100);
  };

  const switchCampus = (c: string) => {
    setCampusOpen(false);
    setCampusLoading(true);
    setTimeout(() => {
      setCampus(c);
      setCampusLoading(false);
    }, 900);
  };

  const remaining = budget - spent;
  const lowBalance = remaining / budget < 0.15;

  const distanceKm = (e: any) => {
    const R = 6371; // km
    const dLat = (e.lat - userPos.lat) * Math.PI / 180;
    const dLng = (e.lng - userPos.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userPos.lat * Math.PI / 180) * Math.cos(e.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.max(0.1, R * c);
  };

  return (
    <motion.div
      animate={shake ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-full w-full overflow-hidden bg-[#E8EEF4]"
    >
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[userPos.lat, userPos.lng]} zoom={15} zoomControl={false} className="h-full w-full" style={{ background: '#E8EEF4' }}>
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution="&copy; OpenStreetMap"
            className="map-tiles"
          />
          
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} />

          {eateries.map((e: any) => (
            <Marker 
              key={e.id} 
              position={[e.lat, e.lng]} 
              icon={createMarkerIcon(e.isMine, e.emoji)}
              eventHandlers={{ click: () => setSelected(e) }}
            />
          ))}

          {routeTarget && (
            <Polyline positions={[[userPos.lat, userPos.lng], [routeTarget.lat, routeTarget.lng]]} color="#FF6B1A" weight={4} dashArray="8 8" />
          )}

          <MapUpdater center={selected ? [selected.lat, selected.lng] : routeTarget ? [userPos.lat, userPos.lng] : [userPos.lat, userPos.lng]} />
        </MapContainer>

        {/* Skeleton overlay during campus switch */}
        <AnimatePresence>
          {campusLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF6B1A] border-t-transparent" />
                <div className="text-xs text-gray-600" style={{fontWeight:600}}>Memuat area kampus...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Header */}
      <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-12">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <NakamLogo size={32} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCampusOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-md backdrop-blur-xl"
            >
              <span className="text-sm">📍</span>
              <span className="text-xs" style={{ fontWeight: 700 }}>{campus}</span>
              <ChevronDown size={14} />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenWallet}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 shadow-md backdrop-blur-xl ${lowBalance ? "bg-red-50/95" : "bg-white/90"}`}
            >
              <Wallet size={14} className={lowBalance ? "text-red-500" : ""} />
              <span className="text-xs" style={{fontWeight:700}}>
                {hideBalance ? "••••" : "Rp " + (remaining / 1000).toFixed(0) + "k"}
              </span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleHideBalance} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xl">
              {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenProfile} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xl">
              <User size={18} />
            </motion.button>
          </div>
        </div>

        {/* Marquee recommendation */}
        <div className="mt-3 overflow-hidden rounded-full border border-white/60 bg-white/60 px-3 py-1.5 backdrop-blur-xl">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap text-[11px] text-gray-700"
          >
            🔥 Lagi rame: Warkop Mas Bro · 🎁 Promo Geprek Bensu 30% · 💸 Burjo Kuli buka 24 jam · 🌟 Cafe Nugas WiFi 100mbps
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.1 }}
          className="mt-3 flex items-center gap-2.5 rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl"
        >
          <Search size={18} className="text-gray-500" />
          <input placeholder="Cari warkop, ayam geprek..." className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400" />
        </motion.div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <motion.button
                key={f} whileTap={{ scale: 0.95 }} layout transition={spring}
                onClick={() => setActiveFilter(active ? null : f)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-xl ${active ? "border-[#FF6B1A] bg-[#FF6B1A] text-white" : "border-white/60 bg-white/70 text-gray-800"}`}
                style={{ fontWeight: 600 }}
              >
                {f}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Low balance warning */}
      <AnimatePresence>
        {lowBalance && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={spring}
            className="absolute bottom-24 left-4 right-32 z-10 flex items-center gap-2 rounded-2xl bg-red-500 p-2.5 text-white shadow-lg"
          >
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-xs" style={{fontWeight:600}}>
              Awas dompet tipis! Cari promo di Cafe & Burjo terdekat.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={triggerRandom}
        animate={rolling ? { rotate: [0, 360, 720, 1080] } : { rotate: 0 }}
        transition={rolling ? { duration: 1 } : spring}
        style={{ boxShadow: "0 10px 40px rgba(255,107,26,0.5)" }}
        className="absolute bottom-8 right-5 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B1A] via-[#FF8C42] to-[#FFB347] px-5 py-4 text-white shadow-2xl"
      >
        <Dice5 size={22} />
        <span style={{ fontWeight: 800 }}>TERSERAH</span>
      </motion.button>

      {/* Route info card */}
      <AnimatePresence>
        {routeTarget && !selected && (
          <RouteInfoCard
            target={routeTarget}
            distance={distanceKm(routeTarget)}
            onClose={() => setRouteTarget(null)}
            onStart={() => { setNavTarget(routeTarget); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <EateryDetail
            eatery={selected}
            onClose={() => setSelected(null)}
            onRoute={() => { setRouteTarget(selected); setSelected(null); }}
            distance={distanceKm(selected)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {navTarget && (
          <Navigator
            target={navTarget}
            distance={distanceKm(navTarget)}
            onClose={() => { setNavTarget(null); setRouteTarget(null); }}
          />
        )}
      </AnimatePresence>

      {/* Campus selector bottom sheet */}
      <AnimatePresence>
        {campusOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setCampusOpen(false)} className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
              className="absolute bottom-0 left-0 right-0 z-40 rounded-t-3xl bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg" style={{fontWeight:800}}>Pilih Kampus</h3>
                <button onClick={() => setCampusOpen(false)} className="rounded-full bg-gray-100 p-1.5"><X size={16} /></button>
              </div>
              <div className="space-y-2">
                {CAMPUSES.map((c) => (
                  <motion.button
                    key={c.code} whileTap={{scale:0.97}}
                    onClick={() => switchCampus(c.code)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 ${campus === c.code ? "border-[#FF6B1A] bg-orange-50" : "border-gray-100"}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B1A] to-[#FF8C42] text-white" style={{fontWeight:800}}>
                      {c.code}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm" style={{fontWeight:700}}>{c.name}</div>
                      <div className="text-xs text-gray-500">{c.students} mahasiswa</div>
                    </div>
                    {campus === c.code && <Check size={18} className="text-[#FF6B1A]" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function haversineDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (pos2.lat - pos1.lat) * (Math.PI / 180);
  const dLng = (pos2.lng - pos1.lng) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(pos1.lat * (Math.PI / 180)) * Math.cos(pos2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function RouteInfoCard({ target, distance, onClose, onStart }: { target: any; distance: number; onClose: () => void; onStart: () => void }) {
  const [mode, setMode] = useState<"walk" | "bike" | "car">("walk");
  const speeds = { walk: 5, bike: 25, car: 35 };
  const minutes = Math.max(1, Math.round((distance / speeds[mode]) * 60));
  const modes = [
    { k: "walk" as const, l: "Jalan", i: <Footprints size={14} /> },
    { k: "bike" as const, l: "Motor", i: <Bike size={14} /> },
    { k: "car" as const, l: "Ojek", i: <Car size={14} /> },
  ];

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }} transition={spring}
      className="absolute bottom-24 left-3 right-3 z-30 rounded-3xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-[#FF6B1A] text-white">
          <Navigation size={20} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-blue-600" style={{fontWeight:700}}>Rute ke</div>
          <div className="text-base tracking-tight" style={{fontWeight:800}}>{target.name}</div>
        </div>
        <button onClick={onClose} className="rounded-full bg-gray-100 p-1.5"><X size={14} /></button>
      </div>

      <div className="mt-3 flex gap-1 rounded-2xl bg-gray-100 p-1">
        {modes.map((m) => {
          const active = mode === m.k;
          return (
            <button key={m.k} onClick={() => setMode(m.k)} className={`relative flex-1 rounded-xl py-2 text-xs ${active ? "text-white" : "text-gray-600"}`} style={{fontWeight:700}}>
              {active && <motion.div layoutId="modeb" transition={spring} className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-[#FF6B1A]" />}
              <span className="relative flex items-center justify-center gap-1.5">{m.i}{m.l}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-blue-50 p-2.5">
          <div className="text-[10px] text-gray-500">Jarak</div>
          <div className="text-sm tracking-tight" style={{fontWeight:800}}>{distance.toFixed(1)} km</div>
        </div>
        <div className="rounded-2xl bg-orange-50 p-2.5">
          <div className="text-[10px] text-gray-500">Estimasi</div>
          <div className="flex items-center gap-1 text-sm tracking-tight" style={{fontWeight:800}}><Clock size={11} /> {minutes} mnt</div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-2.5">
          <div className="text-[10px] text-gray-500">Tercepat</div>
          <div className="text-sm tracking-tight text-emerald-700" style={{fontWeight:800}}>Via Jl. Tlogomas</div>
        </div>
      </div>

      <motion.button
        whileTap={{scale:0.97}} onClick={onStart}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-[#FF6B1A] py-3 text-white shadow-lg shadow-blue-500/30"
        style={{fontWeight:700}}
      >
        <Navigation size={16} /> Mulai Navigasi
      </motion.button>
    </motion.div>
  );
}

function MapBackground() {
  return (
    <svg className="h-full w-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D6DEE8" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="800" fill="#E8EEF4" />
      <rect width="400" height="800" fill="url(#grid)" />
      <path d="M 0 350 Q 200 380 400 320" stroke="#FFFFFF" strokeWidth="22" fill="none" />
      <path d="M 150 0 Q 180 400 220 800" stroke="#FFFFFF" strokeWidth="18" fill="none" />
      <path d="M 0 600 L 400 580" stroke="#FFFFFF" strokeWidth="14" fill="none" />
      <circle cx="80" cy="500" r="60" fill="#C8E6C9" opacity="0.6" />
      <rect x="280" y="450" width="100" height="80" rx="12" fill="#C8E6C9" opacity="0.6" />
      <rect x="200" y="180" width="80" height="60" rx="6" fill="#D8DFEB" />
      <rect x="40" y="220" width="60" height="50" rx="6" fill="#D8DFEB" />
      <rect x="300" y="650" width="70" height="80" rx="6" fill="#D8DFEB" />
    </svg>
  );
}
