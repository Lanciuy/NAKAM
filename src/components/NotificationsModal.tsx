import { memo, useEffect } from "react";
import { motion } from "motion/react";
import { X, Bell, Zap, Megaphone, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/store";
import type { AppNotification } from "@/store/store";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export const NotificationsModal = memo(function NotificationsModal({ onClose }: { onClose: () => void }) {
  const { notifications, theme, markNotificationsAsRead } = useStore();
  const isDark = theme === "dark";

  // Mark all as read when opening the modal
  useEffect(() => {
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "flash_promo":
        return <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-orange-500/20 text-[#FF6B1A]" : "bg-orange-100 text-[#FF6B1A]"}`}><Zap size={18} /></div>;
      case "broadcast":
        return <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}><Megaphone size={18} /></div>;
      default:
        return <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}><Bell size={18} /></div>;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000); // in minutes
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-[80] bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
        className={`absolute bottom-0 left-0 right-0 z-[90] flex max-h-[85dvh] flex-col rounded-t-[32px] md:max-w-md md:mx-auto md:rounded-3xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 shadow-2xl ${isDark ? "bg-[#0f172a] text-white" : "bg-white text-gray-900"}`}
      >
        <div className={`flex items-center justify-between border-b p-5 ${isDark ? "border-white/10" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">Notifikasi</h2>
            {notifications.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"}`}>
                {notifications.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className={`rounded-full p-2 transition-colors ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 pb-8 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <CheckCircle2 size={32} className={isDark ? "text-white/40" : "text-gray-300"} />
              </div>
              <p className="text-sm font-bold text-center">Belum Ada Notifikasi</p>
              <p className="mt-1 text-xs text-center max-w-[200px] leading-relaxed">Semua pemberitahuan, promo, dan update akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notif) => (
                <div key={notif.id} className={`flex gap-4 rounded-2xl p-4 transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold leading-tight">{notif.title}</h4>
                      <span className={`shrink-0 text-[10px] font-medium mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                        {getTimeAgo(notif.time)}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
});
