import { useState } from "react";
import { Outlet, NavLink, useLocation, Navigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  MessageCircle,
  Users,
  BarChart2,
  Megaphone,
  Settings,
  Bell,
  User,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import logoImg from "../../assets/7dee4d2422fa054a783195ac473a80d49248e146.png";

const navItems = [
  { label: "Conversas",    path: "/",              icon: MessageCircle },
  { label: "Contatos",     path: "/contatos",      icon: Users         },
  { label: "Relatórios",   path: "/relatorios",    icon: BarChart2     },
  { label: "Campanhas",    path: "/campanhas",     icon: Megaphone     },
  { label: "Configurações",path: "/configuracoes", icon: Settings      },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { mode, toggle, t } = useTheme();
  const { user, loading, isDemo, logout } = useAuth();
  const isDark = mode === "dark";

  /* ── Auth guard ── */
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: isDark
          ? "linear-gradient(135deg,#0d0221,#1a0845,#2d0e6e)"
          : "#f5f6f8" }}
      >
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const displayName = user.name || "Usuário";
  const displayPlan = user.company?.plan || (isDemo ? "Demo" : "Ativo");
  const initials    = displayName.split(" ").slice(0,2).map((n:string) => n[0]?.toUpperCase()||"").join("");

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ position: "relative" }}>

      {/* ── Background ── */}
      <div
        className="fixed inset-0"
        style={{ background: t.bg, zIndex: 0, transition: "background 0.5s ease" }}
      >
        <div style={{ position: "absolute", top: "5%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: t.blob1, filter: "blur(80px)", animation: "blobFloat1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "40%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: t.blob2, filter: "blur(100px)", animation: "blobFloat2 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 450, height: 450, borderRadius: "50%", background: t.blob3, filter: "blur(90px)", animation: "blobFloat3 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "60%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: t.blob4, filter: "blur(60px)", animation: "blobFloat1 7s ease-in-out infinite reverse" }} />
      </div>

      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,15px) scale(0.95); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-25px,30px) scale(1.08); }
          70% { transform: translate(20px,-15px) scale(0.92); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          30% { transform: translate(20px,25px) scale(1.03); }
          60% { transform: translate(-30px,-10px) scale(0.97); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pulseRing2 {
          0% { transform: scale(0.9); opacity: 0.5; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .pulse-ring-el::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: ${t.pulseColor1};
          animation: pulseRing 2s ease-out infinite;
        }
        .pulse-ring-el::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: ${t.pulseColor2};
          animation: pulseRing2 2s ease-out infinite 0.4s;
        }
        .scrollbar-glass::-webkit-scrollbar { width: 4px; }
        .scrollbar-glass::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-glass::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(167,139,250,0.35)" : "#d1d5db"};
          border-radius: 2px;
        }
        .scrollbar-glass::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "rgba(236,72,153,0.5)" : "#9ca3af"};
        }
        * { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease, box-shadow 0.3s ease; }
      `}</style>

      {/* ── Top Header ── */}
      <div
        className="relative flex flex-col items-center pt-5 pb-3 z-20"
        style={{
          flexShrink: 0,
          background: isDark
            ? "transparent"
            : "linear-gradient(to bottom, #ffffff 0%, #ffffff 70%, #f5f6f8 100%)",
          borderBottom: "none",
        }}
      >
        {/* Right actions */}
        <div className="absolute right-6 top-5 flex items-center gap-2.5">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={isDark ? "Modo claro" : "Modo escuro"}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
              backdropFilter: isDark ? "blur(12px)" : "none",
              border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
              color: isDark ? "rgba(255,255,255,0.7)" : "#374151",
            }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.6 }} transition={{ duration: 0.22 }} style={{ display: "flex" }}>
                  <Sun size={16} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.6 }} transition={{ duration: 0.22 }} style={{ display: "flex" }}>
                  <Moon size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
              backdropFilter: isDark ? "blur(12px)" : "none",
              border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
              color: isDark ? "rgba(255,255,255,0.7)" : "#374151",
            }}
          >
            <Bell size={16} />
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              border: isDark ? "2px solid rgba(255,255,255,0.3)" : "2px solid #ede9fe",
              boxShadow: isDark ? "0 0 16px rgba(236,72,153,0.4)" : "0 2px 8px rgba(124,58,237,0.25)",
              fontSize: 12, fontWeight: 700,
            }}
          >
            {initials || <User size={16} />}
          </div>

          <div className="text-left hidden sm:block">
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: t.textPrimary }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: t.textAccent, lineHeight: 1.2 }}>
              {displayPlan}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sair"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
              border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #fecaca",
              color: "#ef4444",
            }}
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-3" style={{ marginTop: -6 }}>
          <img
            src={logoImg}
            alt="YouTickets"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* ── Pulsing Arrow Button ── */}
        <div className="relative flex justify-center items-center" style={{ width: 24, height: 24, marginTop: -8 }}>
          <div className="pulse-ring-el relative flex items-center justify-center" style={{ width: 24, height: 24 }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={menuOpen ? { ...t.arrowBtnOpen, color: "#ffffff" } : { ...t.arrowBtn, color: menuOpen ? "#fff" : t.arrowColor }}
            >
              <motion.div
                animate={{ rotate: menuOpen ? 180 : 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <ChevronDown size={11} strokeWidth={2.5} />
              </motion.div>
            </button>
          </div>
        </div>

        {/* ── Horizontal Navigation Menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -12, scaleX: 0.5 }}
              animate={{ opacity: 1, y: 0, scaleX: 1 }}
              exit={{ opacity: 0, y: -12, scaleX: 0.5 }}
              transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
              className="mt-3 flex items-center gap-1 px-2.5 py-2"
              style={t.nav}
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      ...(active ? t.navActive : {}),
                      color: active ? "#ffffff" : t.navInactiveText,
                      border: active ? (t.navActive.border as string) : "1px solid transparent",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    <item.icon
                      size={15}
                      style={{
                        filter: active && isDark ? "drop-shadow(0 0 4px rgba(236,72,153,0.8))" : "none",
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: isDark
                            ? "linear-gradient(135deg, #f0abfc, #ec4899)"
                            : "rgba(255,255,255,0.8)",
                          boxShadow: isDark ? "0 0 6px rgba(240,171,252,0.8)" : "0 0 4px rgba(255,255,255,0.6)",
                        }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden relative z-10 px-4 pb-4">
        <Outlet />
      </div>
    </div>
  );
}
