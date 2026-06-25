import { useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore, fmtRp, Transaction } from "@/store/store";
import { Calendar, X, Check, Receipt, CreditCard, ArrowDownRight, Clock, QrCode, Filter, ChevronRight } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export const HistoryTab = memo(function HistoryTab() {
  const { transactions, hideBalance, spent, theme } = useStore();
  const [tx, setTx] = useState<Transaction | null>(null);

  const thisMonthSpent = spent;
  const isDark = theme === "dark";

  return (
    <div className={`flex flex-col min-h-screen pb-24 font-sans ${isDark ? "bg-[#0a0e27] text-white" : "bg-[#F7F9FC] text-slate-800"}`}>
      {/* ─── Sticky Header ─── */}
      <div className={`px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl ${isDark ? "bg-[#0a0e27]/80 border-b border-white/10" : "bg-white/80 border-b border-gray-200"}`}>
        <h1 className="text-2xl font-black tracking-tight">Riwayat</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => alert("Fitur filter segera hadir!")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100"}`}>
            <Filter size={18} />
          </button>
          <button onClick={() => alert("Fitur kalender segera hadir!")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100"}`}>
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* ─── Spending Card (Premium Fintech Style) ─── */}
      <div className="px-5 mt-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-[2rem] p-6 shadow-2xl ${isDark ? "bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-white/10 shadow-indigo-500/10" : "bg-gradient-to-tr from-slate-900 via-slate-800 to-black shadow-slate-900/30"} text-white`}
        >
          {/* Glassmorphic overlays */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <CreditCard size={16} /> Pengeluaran Bulan Ini
            </div>
          </div>
          
          <div className="relative z-10 mt-4 flex items-baseline gap-2">
            <span className="text-[2.5rem] leading-none font-black tracking-tighter">
              {hideBalance ? "Rp •••••••" : fmtRp(thisMonthSpent)}
            </span>
          </div>

          <div className="relative z-10 mt-8 flex items-end justify-between border-t border-white/10 pt-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Total Transaksi</div>
              <div className="flex items-center gap-1.5 font-bold">
                <ArrowDownRight size={16} className="text-emerald-400" />
                <span>{transactions.length > 0 ? `${transactions.length} kali` : 'Belum ada'}</span>
              </div>
            </div>
            <div className="flex -space-x-3">
               {transactions.slice(0, 4).map((t, i) => (
                 <div key={i} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-sm border-2 border-slate-900 shadow-sm" style={{ zIndex: 4 - i }}>{t.emoji}</div>
               ))}
               {transactions.length > 4 && (
                 <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold border-2 border-slate-900" style={{ zIndex: 0 }}>+{transactions.length - 4}</div>
               )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Transactions List ─── */}
      <div className="px-5">
        <h2 className={`text-xs font-black mb-4 uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Semua Transaksi</h2>
        
        <div className="space-y-3">
          {transactions.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTx(t)}
              className={`flex w-full items-center gap-4 rounded-[1.25rem] p-4 text-left transition-all ${isDark ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]" : "bg-white shadow-sm border border-gray-100 hover:shadow-md"}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0 ${isDark ? "bg-white/10" : "bg-slate-50"}`}>
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold truncate mb-0.5">{t.place}</div>
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  <Clock size={11} /> {t.date}
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end">
                <div className={`text-sm font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                  -{hideBalance ? "••••" : fmtRp(t.amount)}
                </div>
                <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md ${isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}>
                  {t.items.length} item
                </div>
              </div>
            </motion.button>
          ))}
          {transactions.length === 0 && (
            <div className={`py-20 rounded-[2rem] text-center flex flex-col items-center justify-center gap-4 ${isDark ? "bg-white/[0.02] border border-dashed border-white/10" : "bg-white border border-dashed border-gray-200"}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <Receipt size={32} className={isDark ? "text-white/20" : "text-gray-300"} />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? "text-white/60" : "text-gray-500"}`}>Belum ada transaksi</p>
                <p className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>Riwayat jajan kamu akan muncul di sini</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {tx && <TxDetail tx={tx} onClose={() => setTx(null)} isDark={isDark} hideBalance={hideBalance} />}
      </AnimatePresence>
    </div>
  );
});

function TxDetail({ tx, onClose, isDark, hideBalance }: { tx: Transaction; onClose: () => void; isDark: boolean; hideBalance: boolean }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
      <motion.div
        initial={{scale:0.95, y: 30, opacity:0}} animate={{scale:1, y: 0, opacity:1}} exit={{scale:0.95, y: 30, opacity:0}} transition={spring}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden ${isDark ? "bg-[#0f172a] text-white border border-white/10" : "bg-white text-gray-900 border border-gray-100"}`}
      >
        {/* Receipt Header (Premium Style) */}
        <div className={`p-6 pb-8 border-b-2 border-dashed ${isDark ? "border-white/20 bg-gradient-to-b from-slate-800 to-[#0f172a]" : "border-gray-200 bg-gradient-to-b from-gray-50 to-white"}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isDark ? "bg-white/10 text-white/50" : "bg-gray-100 text-gray-500"}`}>
              <Receipt size={14} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">E-Receipt</div>
            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
              <X size={16} />
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm mb-4 border border-gray-100 dark:border-white/5" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#fff" }}>
              {tx.emoji}
            </div>
            <h3 className="text-xl font-black tracking-tight">{tx.place}</h3>
            <div className={`flex items-center justify-center gap-1.5 text-[11px] font-bold mt-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <Clock size={12} /> {tx.date} • {new Date(tx.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="px-6 py-6">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>Rincian Pesanan</div>
          <ul className="space-y-3 mb-6">
            {tx.items.map((it, idx) => (
              <li key={`${it}-${idx}`} className="flex items-start justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}>
                    <span className="text-[10px] font-bold">1x</span>
                  </span>
                  <span className="font-bold">{it}</span>
                </div>
                <span className={`text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-500"}`}>Included</span>
              </li>
            ))}
          </ul>
          
          <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${isDark ? "text-white/60" : "text-gray-500"}`}>Total Transaksi</span>
              <span className="text-lg font-black tracking-tighter text-[#FF6B1A]">{hideBalance ? "Rp ••••" : fmtRp(tx.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Status Pembayaran</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1"><Check size={10} strokeWidth={3} /> Berhasil</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center opacity-30">
             <QrCode size={40} />
             <div className="text-[8px] tracking-[0.3em] font-mono mt-2">TRX-{tx.id.substring(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
