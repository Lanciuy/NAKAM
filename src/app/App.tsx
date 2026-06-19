import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { HomeMap } from "./components/HomeMap";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { WalletScreen } from "./components/Wallet";
import { ProfileScreen } from "./components/Profile";
import { AdminPanel } from "./components/AdminPanel";
import { StoreProvider, useStore } from "./store";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

type Phase = "splash" | "login" | "home";

function Inner() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { theme, supabaseUser } = useStore();

  return (
    <div className={`relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden p-0 bg-slate-100 ${theme === "dark" ? "bg-[#020617]" : ""}`}>
      <div className="relative w-full h-[100dvh] max-w-md mx-auto overflow-hidden bg-white text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.15)] md:border-x md:border-slate-200">
        <AnimatePresence>
          {phase === "splash" && (
            <Splash key="splash" onDone={() => {
              if (supabaseUser) setPhase("home");
              else setPhase("login");
            }} />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "login" ? (
            <motion.div key="login" className="absolute inset-0" exit={{ x: "-30%", opacity: 0 }} transition={spring}>
              <Login onDone={() => setPhase("home")} />
            </motion.div>
          ) : phase === "home" ? (
            <motion.div key="home" className="absolute inset-0" initial={{ x: "100%" }} animate={{ x: 0 }} transition={spring}>
              <HomeMap
                onOpenProfile={() => setProfileOpen(true)}
                onOpenWallet={() => setWalletOpen(true)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {walletOpen && <WalletScreen key="wallet" onBack={() => setWalletOpen(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {profileOpen && (
            <ProfileScreen
              key="profile"
              onBack={() => setProfileOpen(false)}
              onOpenMerchant={() => setMerchantOpen(true)}
              onOpenAdmin={() => setAdminOpen(true)}
              onLogout={() => {
                setProfileOpen(false);
                setWalletOpen(false);
                setMerchantOpen(false);
                setAdminOpen(false);
                setPhase("login");
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {merchantOpen && <MerchantDashboard key="merchant" onBack={() => setMerchantOpen(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {adminOpen && <AdminPanel key="admin" onBack={() => setAdminOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Inner />
    </StoreProvider>
  );
}