import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { HomeTab } from "./components/HomeTab";
import { RestaurantsTab } from "./components/RestaurantsTab";
import { HistoryTab } from "./components/HistoryTab";
import { ProfileTab } from "./components/Profile";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { WalletScreen } from "./components/Wallet";
import { AdminPanel } from "./components/AdminPanel";
import { BottomNavBar } from "./components/BottomNavBar";
import { StoreProvider, useStore } from "./store";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

type Phase = "splash" | "login" | "main";
type TabId = "home" | "restaurants" | "history" | "profile";

function Inner() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [walletOpen, setWalletOpen] = useState(false);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { theme, supabaseUser } = useStore();

  return (
    <div className={`relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden p-0 bg-slate-100 ${theme === "dark" ? "bg-[#020617]" : ""}`}>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-white text-slate-900 md:max-w-md shadow-2xl">
        <AnimatePresence>
          {phase === "splash" && (
            <Splash key="splash" onDone={() => {
              if (supabaseUser) setPhase("main");
              else setPhase("login");
            }} />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "login" ? (
            <motion.div key="login" className="absolute inset-0" exit={{ x: "-30%", opacity: 0 }} transition={spring}>
              <Login onDone={() => setPhase("main")} />
            </motion.div>
          ) : phase === "main" ? (
            <motion.div key="main" className="absolute inset-0 flex flex-col bg-[#F8F9FA]" initial={{ x: "100%" }} animate={{ x: 0 }} transition={spring}>
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "home" && (
                    <motion.div key="home" className="absolute inset-0 overflow-y-auto no-scrollbar" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                      <HomeTab onOpenWallet={() => setWalletOpen(true)} />
                    </motion.div>
                  )}
                  {activeTab === "restaurants" && (
                    <motion.div key="restaurants" className="absolute inset-0 overflow-y-auto no-scrollbar" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                      <RestaurantsTab />
                    </motion.div>
                  )}
                  {activeTab === "history" && (
                    <motion.div key="history" className="absolute inset-0 overflow-y-auto no-scrollbar" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                      <HistoryTab />
                    </motion.div>
                  )}
                  {activeTab === "profile" && (
                    <motion.div key="profile" className="absolute inset-0 overflow-y-auto no-scrollbar" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                      <ProfileTab
                        onOpenMerchant={() => setMerchantOpen(true)}
                        onOpenAdmin={() => setAdminOpen(true)}
                        onLogout={() => {
                          setWalletOpen(false);
                          setMerchantOpen(false);
                          setAdminOpen(false);
                          setPhase("login");
                          setActiveTab("home");
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <BottomNavBar activeTab={activeTab} onChange={setActiveTab} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {walletOpen && <WalletScreen key="wallet" onBack={() => setWalletOpen(false)} />}
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