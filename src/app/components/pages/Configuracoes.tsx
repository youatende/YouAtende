import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Bell, Shield, Link, Palette, Users,
  MessageCircle, Smartphone, ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { WhatsAppSection } from "../configuracoes/WhatsAppSection";
import { TeamManagement } from "./TeamManagement";

const menuItems = [
  { label: "Perfil",        icon: User,          color: "#7c3aed" },
  { label: "Notificações",  icon: Bell,          color: "#ec4899" },
  { label: "Segurança",     icon: Shield,        color: "#0ea5e9" },
  { label: "Integrações",   icon: Link,          color: "#10b981" },
  { label: "Aparência",     icon: Palette,       color: "#f59e0b" },
  { label: "Equipes",       icon: Users,         color: "#8b5cf6" },
  { label: "Mensagens",     icon: MessageCircle, color: "#ef4444" },
  { label: "WhatsApp",      icon: Smartphone,    color: "#25D366" },
];

export function Configuracoes() {
  const { t, mode } = useTheme();
  const { user } = useAuth();
  const isDark = mode === "dark";
  const [activeMenu, setActiveMenu] = useState("WhatsApp");

  return (
    <div className="h-full flex gap-3 overflow-hidden">
      <div className="flex flex-col overflow-hidden py-4 px-3" style={{ ...t.panel, width: 220, flexShrink: 0 }}>
        <div className="px-2 mb-4">
          <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Configurações</span>
        </div>
        <div className="flex flex-col gap-1">
          {menuItems.map(item => {
            const active = activeMenu === item.label;
            return (
              <button key={item.label} onClick={() => setActiveMenu(item.label)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background: active ? (isDark ? `${item.color}14` : "#f9fafb") : "transparent",
                  border: active ? (isDark ? `1px solid ${item.color}30` : "1px solid #e5e7eb") : "1px solid transparent",
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: active ? (isDark ? `${item.color}22` : "#f3f4f6") : (isDark ? "rgba(255,255,255,0.06)" : "transparent"),
                  border: `1px solid ${active ? (isDark ? item.color + "40" : "#e5e7eb") : t.border}`,
                }}>
                  <item.icon size={14} style={{ color: active ? (isDark ? item.color : "#374151") : t.textMuted }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? (isDark ? item.color : "#111827") : t.textSecondary }}>
                  {item.label}
                </span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: isDark ? item.color : "#9ca3af" }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative" style={t.panel}>
        <div className="h-full scrollbar-glass px-6 py-5 overflow-y-auto">
          <motion.div key={activeMenu} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
            {activeMenu === "WhatsApp" && <WhatsAppSection t={t} isDark={isDark} />}
            {activeMenu === "Equipes"  && <TeamManagement />}
            {/* Outras seções podem ser adicionadas aqui */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
