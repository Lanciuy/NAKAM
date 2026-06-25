import { useState, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import {
  ArrowLeft, Edit3, Shield, Sun, Moon, Store, ChevronRight,
  Camera, Instagram, Twitter, Loader2, MapPin, Receipt,
  Star, Heart, CreditCard, Bell, HelpCircle, Info,
  Sparkles, TrendingUp, Calendar, Clock
} from "lucide-react";
import { useStore, fmtRp } from "@/store/store";
import { uploadImageToSupabase } from "@/services/supabaseData";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export const ProfileTab = memo(function ProfileTab({ onOpenMerchant, onOpenAdmin, onLogout }: { onOpenMerchant: () => void; onOpenAdmin: () => void; onLogout: () => void }) {
  const { user, setUser, theme, toggleTheme, ghostMode, setGhostMode, showExpense, setShowExpense, campus, transactions, budget, spent } = useStore();
  const [view, setView] = useState<"main" | "edit" | "privacy">("main");
  const [draft, setDraft] = useState(user);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollerRef });
  const coverScale = useTransform(scrollY, [-100, 0, 200], [1.3, 1, 1.15]);
  const coverY = useTransform(scrollY, [0, 200], [0, -60]);
  const titleOpacity = useTransform(scrollY, [60, 140], [0, 1]);

  // ─── Real Stats from Store ───
  const uniquePlaces = new Set(transactions.map(t => t.place)).size;
  const totalTransactions = transactions.length;
  const totalSpent = spent;
  const avgPerTransaction = totalTransactions > 0 ? Math.round(totalSpent / totalTransactions) : 0;

  // ─── Recent transactions (last 5 for display) ───
  const recentTxs = transactions.slice(0, 5);

  // ─── Member since (calculate from oldest transaction or show "Baru Bergabung") ───
  const memberSince = useMemo(() => {
    if (transactions.length === 0) return "Baru Bergabung";
    const timestamps = transactions.filter(t => t.timestamp).map(t => new Date(t.timestamp!).getTime());
    if (timestamps.length === 0) return "Baru Bergabung";
    const oldest = new Date(Math.min(...timestamps));
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${months[oldest.getMonth()]} ${oldest.getFullYear()}`;
  }, [transactions]);

  const isDark = theme === "dark";

  return useMemo(() => (
    <motion.div
      ref={scrollerRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}
      className={`scroll-smooth-y no-scrollbar relative w-full h-full pb-24 overflow-y-auto ${isDark ? "bg-[#0a0e27] text-white" : "bg-[#F7F9FC] text-gray-900"}`}
    >
      {/* ─── Sticky Header ─── */}
      <motion.div
        style={{ opacity: titleOpacity }}
        className={`pointer-events-none sticky top-0 z-30 -mb-12 flex items-center gap-3 px-5 py-3 backdrop-blur-xl ${isDark ? "bg-[#0a0e27]/80 border-b border-white/10" : "bg-white/80 border-b border-gray-200"}`}
      >
        <div className="text-sm font-extrabold">{user.name}</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "main" && (
          <motion.div key="main" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            {/* ═══════ COVER WITH PARALLAX ═══════ */}
            <motion.div
              style={{ scale: coverScale, y: coverY, backgroundImage: user.banner ? `url(${user.banner})` : undefined }}
              className={`relative h-56 overflow-hidden will-change-transform bg-cover bg-center ${!user.banner ? "bg-gradient-to-br from-indigo-900 via-slate-800 to-black" : ""}`}
            >
              {!user.banner && (
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(circle at 20% 30%, white 0, transparent 30%), radial-gradient(circle at 80% 60%, white 0, transparent 30%)"}} />
              )}
              {/* Premium Gradients */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              <div className={`absolute bottom-0 left-0 right-0 h-32 ${isDark ? "bg-gradient-to-t from-[#0a0e27]" : "bg-gradient-to-t from-[#F7F9FC]"}`} />
              <button
                onClick={() => { setDraft(user); setView("edit"); }}
                className="absolute right-5 top-12 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg"
              >
                <Edit3 size={16} />
              </button>
            </motion.div>

            {/* ═══════ AVATAR + INFO ═══════ */}
            <div className="relative px-5 pb-6 -mt-10">
              <div className="relative inline-block">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 blur-sm opacity-60" />
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[3px] ${isDark ? "border-[#0a0e27]" : "border-[#F7F9FC]"} bg-gradient-to-br from-slate-800 to-black text-4xl text-white overflow-hidden shadow-2xl`}>
                  {user.avatar?.startsWith("http") || user.avatar?.startsWith("data:") ? (
                    <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">{user.avatar || user.name?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>
              </div>
              <div className="pt-3">
                <h1 className="text-3xl font-black tracking-tighter">{user.name || "Pengguna Baru"}</h1>
                <p className={`text-sm mt-1 font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>{user.bio || "Tuliskan bio kerenmu di sini..."}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isDark ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" : "bg-orange-50 border border-orange-100 text-orange-600"}`}>
                    <MapPin size={12} /> {campus}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isDark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
                    <Calendar size={12} /> {memberSince}
                  </span>
                </div>
              </div>

              {/* ═══════ SOCIALS ═══════ */}
              {(user.socials?.instagram || user.socials?.twitter) && (
                <div className="mt-4 flex gap-2">
                  {user.socials.instagram && (
                    <a href={`https://instagram.com/${user.socials.instagram}`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${isDark ? "bg-white/[0.03] border border-white/5 text-pink-400 hover:bg-white/10" : "bg-white border border-gray-100 text-pink-600 hover:bg-pink-50"}`}>
                      <Instagram size={14} /> {user.socials.instagram}
                    </a>
                  )}
                  {user.socials.twitter && (
                    <a href={`https://twitter.com/${user.socials.twitter}`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${isDark ? "bg-white/[0.03] border border-white/5 text-sky-400 hover:bg-white/10" : "bg-white border border-gray-100 text-sky-600 hover:bg-sky-50"}`}>
                      <Twitter size={14} /> {user.socials.twitter}
                    </a>
                  )}
                </div>
              )}

              {/* ═══════ STATS CARDS ═══════ */}
              <div className={`mt-6 grid grid-cols-3 gap-3 rounded-[1.5rem] p-4 ${isDark ? "bg-white/[0.02] border border-white/5 backdrop-blur-2xl shadow-2xl shadow-black/50" : "bg-white shadow-md border border-gray-100"}`}>
                <StatCard icon={<MapPin size={16} />} value={uniquePlaces} label="Tempat" color="text-orange-500" isDark={isDark} />
                <StatCard icon={<Receipt size={16} />} value={totalTransactions} label="Transaksi" color="text-blue-500" isDark={isDark} />
                <StatCard icon={<TrendingUp size={16} />} value={avgPerTransaction > 0 ? fmtRp(avgPerTransaction) : "-"} label="Rata-rata" color="text-emerald-500" isDark={isDark} />
              </div>

              {/* ═══════ SPENDING OVERVIEW CARD ═══════ */}
              <div className={`mt-4 overflow-hidden rounded-[1.5rem] p-5 relative ${isDark ? "bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10" : "bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-100"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-100 text-orange-500"}`}>
                      <CreditCard size={16} />
                    </div>
                    <span className="text-sm font-extrabold tracking-tight">Ringkasan Budget</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Total Pengeluaran</div>
                    <div className="text-2xl font-black text-orange-500 tracking-tight mt-0.5">{fmtRp(totalSpent)}</div>
                  </div>
                  {budget > 0 && (
                    <div className="text-right">
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Sisa Budget</div>
                      <div className={`text-xl font-black tracking-tight mt-0.5 ${(budget - totalSpent) >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmtRp(Math.max(0, budget - totalSpent))}</div>
                    </div>
                  )}
                </div>
                {budget > 0 && (
                  <div className="mt-4">
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"} shadow-inner`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (totalSpent / budget) * 100)}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={`h-full rounded-full ${(totalSpent / budget) > 0.8 ? "bg-gradient-to-r from-red-500 to-pink-500" : (totalSpent / budget) > 0.5 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════ RECENT TRANSACTIONS ═══════ */}
              {recentTxs.length > 0 && (
                <div className={`mt-3 rounded-2xl p-4 ${isDark ? "bg-white/[0.04] border border-white/10" : "bg-white shadow-sm"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? "bg-blue-500/15" : "bg-blue-100"}`}>
                      <Clock size={14} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-bold">Transaksi Terakhir</span>
                  </div>
                  <div className="space-y-2">
                    {recentTxs.map((tx) => (
                      <div key={tx.id} className={`flex items-center gap-3 rounded-xl p-2.5 ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
                        <div className="text-xl">{tx.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{tx.place}</div>
                          <div className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{tx.items.slice(0, 2).join(", ")}{tx.items.length > 2 ? ` +${tx.items.length - 2}` : ""}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-orange-500">-{fmtRp(tx.amount)}</div>
                          <div className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{tx.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ SETTINGS ═══════ */}
              <div className="mt-6 space-y-2">
                <div className={`mb-3 px-2 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-gray-400"}`}>Personalisasi & Sistem</div>
                <div className={`rounded-[1.5rem] overflow-hidden ${isDark ? "bg-white/[0.02] border border-white/5" : "bg-white shadow-sm border border-gray-100"}`}>
                  <Row icon={theme === "dark" ? <Moon size={16} /> : <Sun size={16} />} label={`Tema: ${theme === "dark" ? "Gelap" : "Terang"}`} sub="Sesuaikan mode layar" onClick={toggleTheme} theme={theme} />
                  <div className={`h-px w-full ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                  <Row icon={<Store size={16} />} label="Buka Mode Merchant" sub="Akses panel toko kamu" onClick={onOpenMerchant} theme={theme} highlight />
                  {user.name === "Admincuy" && (
                    <>
                      <div className={`h-px w-full ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                      <Row icon={<Shield size={16} />} label="Panel Admin" sub="Sistem bypass darurat" onClick={onOpenAdmin} theme={theme} highlight />
                    </>
                  )}
                </div>
              </div>

              {/* ═══════ LOGOUT ═══════ */}
              <motion.button
                whileTap={{scale:0.97}}
                onClick={() => setConfirmLogout(true)}
                className={`mt-6 w-full rounded-[1.25rem] py-4 text-sm font-bold transition-all ${isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
              >
                Keluar Akun
              </motion.button>

              {/* ═══════ APP VERSION ═══════ */}
              <div className={`mt-6 text-center text-[10px] pb-4 font-semibold uppercase tracking-widest ${isDark ? "text-white/20" : "text-gray-300"}`}>
                Nakam v2.0 · FinTech Edition
              </div>
            </div>
          </motion.div>
        )}

        {view === "edit" && (
          <motion.div key="edit" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
            {/* ─── Edit Header ─── */}
            <div className={`flex items-center gap-3 px-4 pb-3 pt-12 border-b ${isDark ? "bg-[#0a0e27] border-white/10" : "bg-white border-gray-100"}`}>
              <button onClick={() => setView("main")} className={`rounded-full p-1.5 transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="flex-1 text-lg font-extrabold">Edit Profil</h1>
              <button
                onClick={() => { setUser(draft); setView("main"); }}
                className="rounded-full bg-[#FF6B1A] px-4 py-1.5 text-xs text-white font-bold hover:bg-[#e85d12] transition-colors shadow-sm shadow-orange-500/20"
              >
                Simpan
              </button>
            </div>

            <div className="space-y-5 p-5 pb-20">
              {/* ─── Avatar Upload ─── */}
              <div className="flex gap-4 items-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B1A] to-[#FF8C42] text-2xl text-white overflow-hidden shadow-lg shadow-orange-500/20 shrink-0">
                  {draft.avatar?.startsWith("http") || draft.avatar?.startsWith("data:") ? (
                    <img src={draft.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-extrabold">{draft.avatar || draft.name?.[0]?.toUpperCase() || "?"}</span>
                  )}
                  {uploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-white" /></div>}
                </div>
                <label className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                  <Camera size={14} className="inline mr-1.5 -mt-0.5" />
                  Ubah Foto Profil
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadingAvatar(true);
                      const url = await uploadImageToSupabase(e.target.files[0]);
                      if (url) setDraft({ ...draft, avatar: url });
                      setUploadingAvatar(false);
                    }
                  }} />
                </label>
              </div>

              {/* ─── Banner Upload ─── */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>Banner Profil</label>
                <div
                  className={`relative h-28 rounded-2xl overflow-hidden flex items-center justify-center bg-cover bg-center transition-colors ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}
                  style={{ backgroundImage: draft.banner ? `url(${draft.banner})` : undefined }}
                >
                  {uploadingBanner ? (
                    <Loader2 className="animate-spin text-gray-400" />
                  ) : (
                    <label className="cursor-pointer bg-black/50 p-2.5 rounded-full text-white backdrop-blur flex items-center gap-2 text-xs pr-4 hover:bg-black/60 transition-colors font-semibold">
                      <Camera size={14} /> Ganti Cover
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadingBanner(true);
                          const url = await uploadImageToSupabase(e.target.files[0]);
                          if (url) setDraft({ ...draft, banner: url });
                          setUploadingBanner(false);
                        }
                      }} />
                    </label>
                  )}
                </div>
              </div>

              {/* ─── Fields ─── */}
              <Field label="Nama Tampilan" value={draft.name} onChange={(v: string) => setDraft({...draft, name: v})} theme={theme} />
              <Field label="Bio" value={draft.bio} onChange={(v: string) => setDraft({...draft, bio: v})} theme={theme} multiline />

              {/* ─── Social Media ─── */}
              <div className={`pt-3 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <div className="text-xs font-bold mb-3">Sosial Media</div>
                <div className="space-y-3">
                  <Field label="Instagram Username" value={draft.socials?.instagram || ""} onChange={(v: string) => setDraft({...draft, socials: { ...draft.socials, instagram: v }})} theme={theme} />
                  <Field label="Twitter / X Username" value={draft.socials?.twitter || ""} onChange={(v: string) => setDraft({...draft, socials: { ...draft.socials, twitter: v }})} theme={theme} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ LOGOUT MODAL ═══════ */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setConfirmLogout(false)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, opacity:0}}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-3xl p-6 ${isDark ? "bg-[#0f172a] text-white" : "bg-white text-gray-900"}`}
            >
              <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-3xl ${isDark ? "bg-red-500/15" : "bg-red-100"}`}>👋</div>
              <h3 className="text-center text-lg tracking-tight font-extrabold">Keluar dari Nakam?</h3>
              <p className={`mt-1 text-center text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>Kamu harus login lagi untuk lanjut nyari tongkrongan.</p>
              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-colors ${isDark ? "border border-white/10 hover:bg-white/5" : "border border-gray-200 hover:bg-gray-50"}`}
                >
                  Batal
                </button>
                <motion.button
                  whileTap={{scale:0.95}}
                  onClick={() => { setConfirmLogout(false); onLogout(); }}
                  className="flex-1 rounded-2xl bg-red-500 py-3 text-sm text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Keluar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  ), [user, theme, ghostMode, showExpense, campus, view, draft, confirmLogout, uploadingAvatar, uploadingBanner, transactions, budget, spent, uniquePlaces, totalTransactions, totalSpent, avgPerTransaction, memberSince, recentTxs, isDark]);
});

// ─── Sub-Components ───

function StatCard({ icon, value, label, color, isDark }: { icon: React.ReactNode; value: number | string; label: string; color: string; isDark: boolean }) {
  return (
    <div className="text-center">
      <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-gray-50"} ${color}`}>
        {icon}
      </div>
      <div className="text-lg font-extrabold">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</div>
      <div className={`text-[10px] font-medium ${isDark ? "text-white/40" : "text-gray-500"}`}>{label}</div>
    </div>
  );
}

function Row({ icon, label, sub, onClick, theme, highlight }: any) {
  const isDark = theme === "dark";
  return (
    <motion.button whileTap={{scale:0.98}} onClick={onClick}
      className={`flex w-full items-center gap-4 p-4 transition-all ${
        highlight
          ? (isDark ? "bg-gradient-to-r from-orange-500/10 to-transparent hover:bg-orange-500/20" : "bg-orange-50/50 hover:bg-orange-50")
          : (isDark ? "bg-transparent hover:bg-white/[0.03]" : "bg-transparent hover:bg-gray-50")
      }`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${highlight ? (isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-500") : isDark ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-600"}`}>{icon}</div>
      <div className="flex-1 text-left">
        <div className="text-sm font-extrabold">{label}</div>
        <div className={`text-xs mt-0.5 font-medium ${highlight ? (isDark ? "text-orange-400/60" : "text-orange-500/60") : isDark ? "text-white/40" : "text-gray-500"}`}>{sub}</div>
      </div>
      <ChevronRight size={18} className="opacity-40" />
    </motion.button>
  );
}

function Toggle({ icon, label, sub, value, onChange, theme }: any) {
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-3.5 ${isDark ? "border border-white/10 bg-white/[0.04]" : "bg-white shadow-sm"}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? "bg-white/10" : "bg-orange-50 text-[#FF6B1A]"}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold">{label}</div>
        <div className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[#FF6B1A]" : isDark ? "bg-white/20" : "bg-gray-300"}`}>
        <motion.span layout transition={spring} className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${value ? "right-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, theme, multiline }: any) {
  const isDark = theme === "dark";
  return (
    <div>
      <label className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} rows={3}
          className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors resize-none ${isDark ? "border-white/10 bg-white/5 focus:border-orange-500/50" : "border-gray-200 bg-white focus:border-orange-500"}`} />
      ) : (
        <input value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${isDark ? "border-white/10 bg-white/5 focus:border-orange-500/50" : "border-gray-200 bg-white focus:border-orange-500"}`} />
      )}
    </div>
  );
}
