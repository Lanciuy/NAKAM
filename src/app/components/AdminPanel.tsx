import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Check, Plus, Store } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { adminAddMerchant } from "../supabaseData";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const CAMPUSES = [
  { code: "UMM", name: "Universitas Muhammadiyah Malang" },
  { code: "UB", name: "Universitas Brawijaya" },
  { code: "UM", name: "Universitas Negeri Malang" },
];

const EMOJI_PRESET = ["🍜", "🍳", "🍗", "☕", "🍚", "🥘", "🍔", "🍱", "🧋", "🍡"];

const createMarkerIcon = (emoji: string) => L.divIcon({
  className: '',
  html: `<div class="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl shadow-xl">${emoji || '🍜'}</div><div class="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] text-white shadow" style="font-weight:700">LOKASI TOKO</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍜");
  const [campus, setCampus] = useState("UMM");
  const [price, setPrice] = useState("10k - 25k");
  const [lat, setLat] = useState(-7.9213);
  const [lng, setLng] = useState(112.5990);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function LocationMarker() {
    useMapEvents({ click(e) { setLat(e.latlng.lat); setLng(e.latlng.lng); } });
    return <Marker position={[lat, lng]} icon={createMarkerIcon(emoji)} />;
  }

  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    map.flyTo(center, map.getZoom());
    return null;
  }

  const handleSave = async () => {
    if (!name || name.length < 3) return;
    setLoading(true);
    const ok = await adminAddMerchant({ name, campus, emoji, price, lat, lng });
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
      }, 2000);
    } else {
      alert("Gagal menambahkan toko. Pastikan kamu sudah menjalankan SQL untuk menghapus constraint user_id.");
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={spring}
      className="scroll-smooth-y no-scrollbar absolute inset-0 z-50 h-full overflow-y-auto bg-gradient-to-b from-[#1a1f4d] to-[#0a0e27] text-white"
    >
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="rounded-full bg-white/10 p-2">
          <ArrowLeft size={18} />
        </motion.button>
        <div className="flex-1">
          <div className="text-xl font-bold flex items-center gap-2">👑 Admin Panel</div>
          <div className="text-xs text-white/60">Tambah toko tanpa batas (Bypass User ID)</div>
        </div>
      </div>

      <div className="px-5 pb-20 space-y-6">
        {/* Identitas Toko */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#FF6B1A]">1. Identitas Toko</h2>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60">Ikon</label>
              <select
                value={emoji} onChange={(e) => setEmoji(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-xl outline-none"
              >
                {EMOJI_PRESET.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs text-white/60">Nama Warung</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Warkop Pak Man"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none placeholder:text-white/30"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/60">Range Harga</label>
            <input
              value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Misal: 10k - 25k"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* Kampus */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#FF6B1A]">2. Area Kampus</h2>
          <div className="grid grid-cols-3 gap-2">
            {CAMPUSES.map((c) => {
              const active = campus === c.code;
              return (
                <button
                  key={c.code} onClick={() => setCampus(c.code)}
                  className={`rounded-xl border p-3 text-center transition-all ${active ? "border-[#FF6B1A] bg-[#FF6B1A]/20" : "border-white/10 bg-white/5"}`}
                >
                  <div className="text-sm font-bold">{c.code}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lokasi Peta */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#FF6B1A]">3. Titik Koordinat GPS</h2>
          <div className="h-64 w-full rounded-2xl overflow-hidden border border-white/10 relative">
            <MapContainer center={[lat, lng]} zoom={16} zoomControl={false} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <LocationMarker />
              <MapUpdater center={[lat, lng]} />
            </MapContainer>
            <div className="absolute top-2 left-2 right-2 z-[400] rounded-xl bg-black/70 backdrop-blur-md p-2 text-center text-xs">
              Ketuk peta untuk geser Pin
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl bg-white/5 p-2 text-center text-xs text-white/60">Lat: {lat.toFixed(5)}</div>
            <div className="flex-1 rounded-xl bg-white/5 p-2 text-center text-xs text-white/60">Lng: {lng.toFixed(5)}</div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={loading || !name}
          onClick={handleSave}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold shadow-xl ${
            success ? "bg-emerald-500 text-white" : loading || !name ? "bg-white/10 text-white/40" : "bg-gradient-to-r from-[#FF6B1A] to-[#FF8C42] text-white"
          }`}
        >
          {loading ? "Menyimpan..." : success ? <><Check size={18} /> Berhasil Disimpan!</> : <><Store size={18} /> Daftarkan Warung</>}
        </motion.button>
      </div>
    </motion.div>
  );
}
