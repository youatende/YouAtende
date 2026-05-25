import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Bell, Shield, Link, Palette, Users,
  MessageCircle, Smartphone, ChevronRight, Check,
  Plus, Pencil, Trash2, Unplug, ChevronDown, ChevronUp,
  Copy, RefreshCw, Wifi, WifiOff, X, Phone, Zap,
  Hash, Building2, KeyRound, HelpCircle, ShieldCheck,
  MessageSquare, Clock, Loader2, AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  listConnections, createConnection, updateConnection,
  deleteConnection, restartConnection,
  WhatsAppSession
} from "../../services/whatsappService";
import { TeamManagement } from "./TeamManagement";
import logoImg from "../../../assets/7dee4d2422fa054a783195ac473a80d49248e146.png";

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

interface WaChannel {
  id: string;
  name: string;
  phone: string;
  status: "connected" | "disconnected" | "pending";
  lastUpdate: string;
  default: boolean;
  typing: boolean;
  recording: boolean;
  token: string;
  msgInactivity: string;
  msgConclusion: string;
  msgOutOfHours: string;
  integration: string;
}

const mockChannels: WaChannel[] = [
  {
    id: "1", name: "API Oficial – Suporte",
    phone: "+55 (80) 0501-3000", status: "connected",
    lastUpdate: "01/04/2026 09:29", default: true, typing: true, recording: true,
    token: "sk_live_01KM694959JV84T4W9ZVkBGVNC",
    msgInactivity: "", msgConclusion: "", msgOutOfHours: "", integration: "",
  },
  {
    id: "2", name: "API Oficial – Cobranças",
    phone: "+55 (11) 4002-8922", status: "connected",
    lastUpdate: "31/03/2026 15:42", default: false, typing: false, recording: false,
    token: "sk_live_92BXK341PLMQ87TZ3HNWsECKY",
    msgInactivity: "", msgConclusion: "", msgOutOfHours: "", integration: "",
  },
  {
    id: "3", name: "API Oficial – Vendas",
    phone: "+55 (21) 3030-4040", status: "disconnected",
    lastUpdate: "28/03/2026 08:15", default: false, typing: true, recording: false,
    token: "sk_live_77GHJ120RSTY56OP9QWA",
    msgInactivity: "", msgConclusion: "", msgOutOfHours: "", integration: "",
  },
];

/* ─── Shared UI ─────────────────────────────────────────────────────────── */

function GlassToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex items-center flex-shrink-0"
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? "linear-gradient(135deg, #ec4899, #7c3aed)" : "rgba(124,58,237,0.12)",
        border: value ? "none" : "1px solid rgba(124,58,237,0.2)",
        boxShadow: value ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%",
        background: value ? "white" : "#c4b5fd",
        left: value ? 22 : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.25s ease, background 0.2s ease",
      }} />
    </button>
  );
}

function GlassToggleSimple({ initial = false }: { initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className="relative flex items-center flex-shrink-0"
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? "linear-gradient(135deg, #ec4899, #7c3aed)" : "rgba(124,58,237,0.12)",
        border: on ? "none" : "1px solid rgba(124,58,237,0.2)",
        boxShadow: on ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%",
        background: on ? "white" : "#c4b5fd",
        left: on ? 22 : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.25s ease, background 0.2s ease",
      }} />
    </button>
  );
}

function AccordionSection({ title, children, icon: Icon, defaultOpen = false, t, isDark }: {
  title: string; children: React.ReactNode; icon: React.ElementType;
  defaultOpen?: boolean; t: any; isDark: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
      background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-all hover:opacity-80"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} style={{ color: "#7c3aed" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={15} style={{ color: t.textMuted }} />
          : <ChevronDown size={15} style={{ color: t.textMuted }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 flex flex-col gap-3"
              style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb" }}>
              <div className="mt-3">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldLabel({ children, t }: { children: React.ReactNode; t: any }) {
  return (
    <label className="block mb-1.5" style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>
      {children}
    </label>
  );
}

function StyledInput({ value, onChange, placeholder, t, suffix }: {
  value?: string; onChange?: (v: string) => void;
  placeholder?: string; t: any; suffix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none"
        style={{ fontSize: 13, color: t.textPrimary }}
      />
      {suffix}
    </div>
  );
}

function StyledTextarea({ value, onChange, placeholder, t }: {
  value?: string; onChange?: (v: string) => void; placeholder?: string; t: any;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full px-4 py-3 rounded-xl outline-none resize-none"
      style={{ ...t.panelInput, fontSize: 13, color: t.textPrimary }}
    />
  );
}

/* ─── WhatsApp Modal ────────────────────────────────────────────────────── */

function WaModal({ channel, onClose, onSave, t, isDark }: {
  channel: WaChannel | null; onClose: () => void;
  onSave: (ch: WaChannel) => void; t: any; isDark: boolean;
}) {
  const isNew = !channel;
  const empty: WaChannel = {
    id: String(Date.now()), name: "", phone: "", status: "pending",
    lastUpdate: "", default: false, typing: false, recording: false,
    token: "", msgInactivity: "", msgConclusion: "", msgOutOfHours: "", integration: "",
  };
  const [form, setForm] = useState<WaChannel>(channel ?? empty);
  const set = (key: keyof WaChannel, val: any) => setForm(f => ({ ...f, [key]: val }));
  const refreshToken = () => set("token", "sk_live_" + Math.random().toString(36).toUpperCase().slice(2, 24));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: isDark ? "rgba(18,8,40,0.97)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)"
            : "0 24px 64px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, rgba(37,211,102,0.2), rgba(124,58,237,0.2))",
              border: isDark ? "1px solid rgba(37,211,102,0.3)" : "1px solid #d1fae5",
            }}>
              <Smartphone size={17} style={{ color: "#25D366" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>
              {isNew ? "Nova Conexão WhatsApp" : "Editar WhatsApp"}
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
              color: t.textMuted,
            }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-glass flex flex-col gap-4">

          {/* Nome */}
          <div>
            <FieldLabel t={t}>Nome do Canal</FieldLabel>
            <StyledInput value={form.name} onChange={v => set("name", v)}
              placeholder="Ex: API Oficial – Suporte" t={t} />
          </div>

          {/* Número */}
          <div>
            <FieldLabel t={t}>Número do WhatsApp</FieldLabel>
            <StyledInput value={form.phone} onChange={v => set("phone", v)}
              placeholder="+55 (11) 99999-0000" t={t}
              suffix={<Phone size={14} style={{ color: t.textMuted, flexShrink: 0 }} />} />
          </div>

          {/* Configurações */}
          <AccordionSection title="Configurações" icon={Zap} defaultOpen t={t} isDark={isDark}>
            <div className="flex items-center gap-6 mb-4">
              {([
                { label: "Padrão",   key: "default"   as keyof WaChannel },
                { label: "Digitando",key: "typing"    as keyof WaChannel },
                { label: "Gravando", key: "recording" as keyof WaChannel },
              ] as { label: string; key: keyof WaChannel }[]).map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <GlassToggle value={form[item.key] as boolean} onChange={v => set(item.key, v)} />
                  <span style={{ fontSize: 13, color: t.textSecondary }}>{item.label}</span>
                </div>
              ))}
            </div>
            <FieldLabel t={t}>Token de Acesso</FieldLabel>
            <StyledInput value={form.token} onChange={v => set("token", v)}
              placeholder="sk_live_..." t={t}
              suffix={
                <button onClick={refreshToken}
                  className="transition-all hover:scale-110 flex-shrink-0"
                  style={{ color: t.textMuted }}>
                  <RefreshCw size={13} />
                </button>
              } />
          </AccordionSection>

          {/* Mensagens */}
          <AccordionSection title="Mensagens" icon={MessageCircle} t={t} isDark={isDark}>
            <div className="flex flex-col gap-3">
              {([
                { key: "msgInactivity" as keyof WaChannel, label: "Mensagem de inatividade" },
                { key: "msgConclusion" as keyof WaChannel, label: "Mensagem de conclusão" },
                { key: "msgOutOfHours" as keyof WaChannel, label: "Mensagem de fora de expediente" },
              ] as { key: keyof WaChannel; label: string }[]).map(f => (
                <div key={f.key}>
                  <FieldLabel t={t}>{f.label}</FieldLabel>
                  <StyledTextarea value={form[f.key] as string}
                    onChange={v => set(f.key, v)} placeholder={f.label} t={t} />
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* Integrações */}
          <AccordionSection title="Integrações" icon={Link} t={t} isDark={isDark}>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel t={t}>Fluxo para Primeiro Contato</FieldLabel>
                <div className="flex items-center px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
                  <select className="flex-1 bg-transparent outline-none appearance-none"
                    style={{ fontSize: 13, color: t.textSecondary }}>
                    <option>Ura Padrão</option>
                    <option>Boas-vindas</option>
                    <option>Qualificação</option>
                  </select>
                  <ChevronDown size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                </div>
              </div>
              <div>
                <FieldLabel t={t}>Fluxo Chatbot Padrão</FieldLabel>
                <div className="flex items-center px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
                  <select className="flex-1 bg-transparent outline-none appearance-none"
                    style={{ fontSize: 13, color: t.textSecondary }}>
                    <option>Ura Padrão</option>
                    <option>Chatbot Vendas</option>
                    <option>Chatbot Suporte</option>
                  </select>
                  <ChevronDown size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl transition-all hover:scale-105"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
              fontSize: 13, fontWeight: 500, color: t.textSecondary,
            }}>
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #ec4899, #7c3aed)",
              border: "none", fontSize: 13, fontWeight: 600, color: "white",
              boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
            }}>
            <Check size={14} />
            Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── WhatsApp Section ──────────────────────────────────────────────────── */

/* ── Adapter: API → UI ── */
function adaptConnection(w: WhatsAppSession): WaChannel {
  const statusMap: Record<string, "connected"|"disconnected"|"pending"> = {
    CONNECTED: "connected", DISCONNECTED: "disconnected", TIMEOUT: "disconnected",
    qrcode: "pending", PAIRING: "pending", OPENING: "pending",
  };
  return {
    id:           w.id,
    name:         w.name,
    phone:        w.number || "",
    status:       statusMap[w.status] || "pending",
    lastUpdate:   w.updatedAt ? new Date(w.updatedAt).toLocaleString("pt-BR") : "—",
    default:      w.isDefault || false,
    typing:       false,
    recording:    false,
    token:        w.token || "",
    msgInactivity:"",
    msgConclusion: w.farewellMessage || "",
    msgOutOfHours: w.outOfHoursMessage || "",
    integration:  "",
  };
}
function adaptToApi(ch: WaChannel): Partial<WhatsAppSession> {
  return {
    name:             ch.name,
    number:           ch.phone,
    token:            ch.token,
    isDefault:        ch.default,
    farewellMessage:  ch.msgConclusion,
    outOfHoursMessage: ch.msgOutOfHours,
  };
}

function WhatsAppSection({ t, isDark }: { t: any; isDark: boolean }) {
  const { isDemo } = useAuth();
  const [channels, setChannels]     = useState<WaChannel[]>(mockChannels);
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState<string|null>(null);
  const [modalChannel, setModalChannel] = useState<WaChannel | null | undefined>(undefined);

  const loadChannels = useCallback(async () => {
    if (isDemo) { setChannels(mockChannels); return; }
    setLoading(true);
    setApiError(null);
    try {
      const conns = await listConnections();
      setChannels(conns.length > 0 ? conns.map(adaptConnection) : mockChannels);
    } catch {
      setApiError("Não foi possível carregar as conexões.");
      setChannels(mockChannels);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  const openNew    = () => setModalChannel(null);
  const openEdit   = (ch: WaChannel) => setModalChannel(ch);
  const closeModal = () => setModalChannel(undefined);

  const handleSave = async (ch: WaChannel) => {
    closeModal();
    setChannels(prev => {
      const exists = prev.find(c => c.id === ch.id);
      return exists ? prev.map(c => c.id===ch.id?ch:c)
                    : [...prev, { ...ch, status:"pending", lastUpdate:"Agora" }];
    });
    if (isDemo) return;
    try {
      const exists = channels.find(c => c.id === ch.id);
      if (exists) await updateConnection(ch.id, adaptToApi(ch));
      else        await createConnection(ch.name);
      loadChannels();
    } catch { loadChannels(); }
  };

  const handleDelete = async (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
    if (isDemo) return;
    try { await deleteConnection(id); } catch { loadChannels(); }
  };

  const handleToggle = async (id: string) => {
    setChannels(prev =>
      prev.map(c => c.id===id
        ? { ...c, status: c.status==="connected" ? "disconnected" : "connected" }
        : c));
    if (isDemo) return;
    try { await restartConnection(id); } catch { loadChannels(); }
  };

  const statusCfg = {
    connected:    { label: "Conectado",    color: "#10b981", bg: isDark ? "rgba(16,185,129,0.12)"  : "#f0fdf4", border: isDark ? "rgba(16,185,129,0.25)"  : "#bbf7d0", Icon: Wifi      },
    disconnected: { label: "Desconectado", color: "#ef4444", bg: isDark ? "rgba(239,68,68,0.12)"   : "#fef2f2", border: isDark ? "rgba(239,68,68,0.25)"   : "#fecaca", Icon: WifiOff   },
    pending:      { label: "Aguardando",   color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)"  : "#fffbeb", border: isDark ? "rgba(245,158,11,0.25)"  : "#fde68a", Icon: RefreshCw },
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Conexões WhatsApp</h3>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
            Gerencie seus canais via Official API (Meta)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadChannels}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)", border: `1px solid ${t.borderStrong}`, color: t.textSecondary }}>
            {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <RefreshCw size={15}/>}
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              border: "none", fontSize: 13, fontWeight: 600, color: "white",
              boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
            }}>
            <Plus size={15} />
            Nova Conexão
          </button>
        </div>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
          style={{ background: isDark?"rgba(239,68,68,0.1)":"#fef2f2", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} style={{ color:"#ef4444", flexShrink:0 }}/><span style={{ fontSize:12, color:"#ef4444" }}>{apiError}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total de Canais",  value: channels.length,                                       color: "#7c3aed" },
          { label: "Conectados",       value: channels.filter(c => c.status === "connected").length,  color: "#10b981" },
          { label: "Desconectados",    value: channels.filter(c => c.status === "disconnected").length, color: "#ef4444" },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl" style={t.panelSubtle}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {channels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: t.textMuted }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{
              background: "linear-gradient(135deg, rgba(37,211,102,0.12), rgba(124,58,237,0.12))",
              border: isDark ? "1px solid rgba(37,211,102,0.2)" : "1px solid #d1fae5",
            }}>
              <Smartphone size={28} style={{ color: "#25D366" }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textSecondary }}>Nenhum canal configurado</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "Nova Conexão" para adicionar.</div>
          </div>
        )}

        {channels.map((ch, i) => {
          const s = statusCfg[ch.status];
          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                background: "linear-gradient(135deg, rgba(37,211,102,0.18), rgba(18,140,126,0.18))",
                border: isDark ? "1px solid rgba(37,211,102,0.25)" : "1px solid #d1fae5",
              }}>
                <Smartphone size={20} style={{ color: "#25D366" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{ch.name}</span>
                  {ch.default && (
                    <span className="px-2 py-0.5 rounded-full" style={{
                      fontSize: 10, fontWeight: 600,
                      background: isDark ? "rgba(124,58,237,0.2)" : "#ede9fe",
                      border: isDark ? "1px solid rgba(124,58,237,0.3)" : "1px solid #ddd6fe",
                      color: "#7c3aed",
                    }}>Padrão</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: t.textSecondary }}>{ch.phone}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                  Última atualização: {ch.lastUpdate}
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0" style={{
                background: s.bg, border: `1px solid ${s.border}`,
              }}>
                <s.Icon size={12} style={{ color: s.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => handleToggle(ch.id)} title={ch.status === "connected" ? "Desconectar" : "Conectar"}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                    color: ch.status === "connected" ? "#ef4444" : "#10b981",
                  }}>
                  <Unplug size={13} />
                </button>
                <button onClick={() => openEdit(ch)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: isDark ? "rgba(124,58,237,0.12)" : "#f5f3ff",
                    border: isDark ? "1px solid rgba(124,58,237,0.2)" : "1px solid #ede9fe",
                    color: "#7c3aed",
                  }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(ch.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                    border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #fecaca",
                    color: "#ef4444",
                  }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {modalChannel !== undefined && (
          <WaModal channel={modalChannel} onClose={closeModal} onSave={handleSave} t={t} isDark={isDark} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Meta Partner Modal ────────────────────────────────────────────────── */

function MetaPartnerModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const checkItems = [
    { title: "Parceiro Oficial Meta",  desc: "Vinculado à Oficial API do Meta Business Partners" },
    { title: "Número verificado",      desc: "Selo oficial de verificação no WhatsApp, transmitindo confiança aos clientes." },
    { title: "Conformidade LGPD",      desc: "Seus contatos e dados armazenados em conformidade com a LGPD e DPA." },
    { title: "Alta disponibilidade",   desc: "Modelos de mensagens pré-aprovados pela Meta, sem risco de bloqueio" },
    { title: "Escalabilidade total",   desc: "Infraestrutura com 99,9% de uptime e suporte técnico redundante" },
  ];

  const cardBg       = isDark ? "linear-gradient(160deg, #1a0a2e 0%, #16082a 60%, #0e0620 100%)" : "#ffffff";
  const cardBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const titleColor   = isDark ? "#ffffff" : "#111827";
  const subColor     = isDark ? "rgba(255,255,255,0.52)" : "#6b7280";
  const statBg       = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
  const statBorder   = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const statVal      = isDark ? "#c4b5fd" : "#7c3aed";
  const statLbl      = isDark ? "rgba(255,255,255,0.38)" : "#9ca3af";
  const msgBg        = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const msgBorder    = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb";
  const divColor     = isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0";
  const closeBtnClr  = isDark ? "rgba(255,255,255,0.5)" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[200] p-5"
      style={{
        background: isDark ? "rgba(8,2,22,0.82)" : "rgba(60,40,100,0.38)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full flex flex-col"
        style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: isDark
            ? "0 24px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(124,58,237,0.18)"
            : "0 20px 60px rgba(0,0,0,0.13), 0 0 0 1px rgba(124,58,237,0.07)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px flex-shrink-0" style={{
          background: "linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.6) 35%, rgba(37,211,102,0.45) 65%, transparent 95%)",
        }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { w: 320, h: 320, top: -80,  left: -60,  color: "124,58,237",  dur: 9,  del: 0 },
            { w: 260, h: 260, bottom: -60, right: -50, color: "37,211,102", dur: 11, del: 2 },
            { w: 200, h: 200, top: "42%", left: "48%", color: "236,72,153", dur: 13, del: 4 },
          ].map((b, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.16, 1], opacity: [0.12, 0.26, 0.12] }}
              transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.del }}
              className="absolute rounded-full"
              style={{
                width: b.w, height: b.h,
                top: (b as any).top, left: (b as any).left,
                bottom: (b as any).bottom, right: (b as any).right,
                background: `radial-gradient(circle, rgba(${b.color},0.22) 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full px-8 pt-6 pb-6 gap-0 overflow-y-auto scrollbar-glass">
          <div className="flex items-center justify-between flex-shrink-0 mb-4">
            <img
              src={logoImg}
              alt="YouTickets"
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: isDark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
                color: closeBtnClr,
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 mb-4">
            {["Parceiro Oficial Meta", "BSP Certificado Meta"].map((label) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: isDark ? "rgba(37,211,102,0.11)" : "rgba(37,211,102,0.09)",
                  border: isDark ? "1px solid rgba(37,211,102,0.3)" : "1px solid rgba(37,211,102,0.34)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#25D366" }}
                >
                  <Check size={9} strokeWidth={3} style={{ color: "white" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#86efac" : "#16a34a" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 mb-5">
            <h2 style={{ fontSize: 26, fontWeight: 800, color: titleColor, lineHeight: 1.22, marginBottom: 6 }}>
              Ativação Oficial WhatsApp API
            </h2>
            <p style={{ fontSize: 14, color: subColor, lineHeight: 1.55 }}>
              Integração certificada com a infraestrutura oficial da Meta
            </p>
          </div>

          <div className="flex flex-1 gap-0 min-h-0" style={{ borderTop: `1px solid ${divColor}`, paddingTop: 20 }}>
            <div className="flex flex-col justify-between flex-shrink-0 pr-8" style={{ width: "46%", borderRight: `1px solid ${divColor}` }}>
              <div className="flex flex-col gap-4">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: titleColor, lineHeight: 1.35, marginBottom: 6 }}>
                    Conecte sua operação<br />ao WhatsApp nível enterprise
                  </div>
                  <div style={{ fontSize: 13, color: subColor, lineHeight: 1.6 }}>
                    Infraestrutura oficial, escalável e sem risco de bloqueio
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { Icon: ShieldCheck,    value: "99,9%", label: "uptime"      },
                    { Icon: MessageCircle,  value: "2h",    label: "suporte SLA" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 px-3 py-2 rounded-full flex-1"
                      style={{ background: statBg, border: statBorder }}
                    >
                      <s.Icon size={12} style={{ color: statVal, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: statVal }}>{s.value}</span>
                      <span style={{ fontSize: 11, color: statLbl }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: msgBg, border: msgBorder }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(124,58,237,0.2)" : "#ede9fe" }}>
                    <MessageSquare size={13} style={{ color: "#7c3aed" }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: titleColor }}>Mensagens ilimitadas</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    border: "none", fontSize: 14, fontWeight: 700, color: "white",
                    boxShadow: "0 6px 22px rgba(37,211,102,0.44)",
                  }}
                >
                  <Check size={14} strokeWidth={2.5} />
                  Ativar integração oficial
                </button>
                <div className="flex items-center justify-center gap-1.5">
                  <Clock size={12} style={{ color: subColor }} />
                  <span style={{ fontSize: 12, color: subColor }}>Leva menos de 5 minutos</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between flex-1 pl-8">
              <div className="flex flex-col gap-0 flex-1">
                {checkItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + i * 0.07, duration: 0.26 }}
                    className="flex items-start gap-3 flex-1"
                    style={{
                      borderBottom: i < checkItems.length - 1 ? `1px solid ${divColor}` : "none",
                      paddingTop: i === 0 ? 0 : 14,
                      paddingBottom: i < checkItems.length - 1 ? 14 : 0,
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#25D366", boxShadow: "0 2px 8px rgba(37,211,102,0.32)" }}>
                      <Check size={9} strokeWidth={3} style={{ color: "white" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: titleColor, marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: subColor, lineHeight: 1.58 }}>{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  style={{ fontSize: 13, fontWeight: 500, color: closeBtnClr, background: "none", border: "none", cursor: "pointer" }}
                  className="transition-all hover:opacity-60"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Integrações Section ───────────────────────────────────────────────── */

function IntegracoesSection({ t, isDark, onShowHelp }: { t: any; isDark: boolean; onShowHelp: () => void }) {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    appId: "",
  });
  const [saved, setSaved] = useState(false);

  const webhookUrl = "https://api.youtickets.com.br/webhook/whatsapp/v1";

  const copy = () => {
    navigator.clipboard.writeText(webhookUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Integrações</h3>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
          Configure as credenciais das suas APIs externas
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl overflow-hidden"
        style={{
          border: isDark ? "1px solid rgba(37,211,102,0.18)" : "1px solid #d1fae5",
          background: isDark ? "rgba(37,211,102,0.04)" : "#f8fff9",
        }}
      >
        <div className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: isDark ? "1px solid rgba(37,211,102,0.12)" : "1px solid #d1fae5" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{
            background: "linear-gradient(135deg, rgba(37,211,102,0.2), rgba(18,140,126,0.2))",
            border: isDark ? "1px solid rgba(37,211,102,0.3)" : "1px solid #a7f3d0",
          }}>
            <Smartphone size={19} style={{ color: "#25D366" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>
              WhatsApp Business API
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Meta for Developers — Official API</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{
              background: isDark ? "rgba(37,211,102,0.12)" : "#ecfdf5",
              border: isDark ? "1px solid rgba(37,211,102,0.25)" : "1px solid #a7f3d0",
            }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>Ativo</span>
            </div>
            <button
              onClick={onShowHelp}
              title="Saiba mais sobre a parceria Meta"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: isDark ? "rgba(24,119,242,0.12)" : "rgba(24,119,242,0.08)",
                border: isDark ? "1px solid rgba(24,119,242,0.28)" : "1px solid rgba(24,119,242,0.2)",
              }}
            >
              <HelpCircle size={15} style={{ color: "#1877F2" }} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{
            background: isDark ? "rgba(0,0,0,0.2)" : "#f3f4f6",
            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb",
          }}>
            <div className="flex flex-col flex-1 min-w-0">
              <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 2 }}>
                URL DO WEBHOOK (forneça ao painel Meta)
              </span>
              <span className="truncate" style={{ fontSize: 12, color: t.textSecondary, fontFamily: "monospace" }}>
                {webhookUrl}
              </span>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:scale-105 flex-shrink-0"
              style={{
                background: copied
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : isDark ? "rgba(124,58,237,0.2)" : "#ede9fe",
                border: isDark ? "1px solid rgba(124,58,237,0.3)" : "1px solid #ddd6fe",
                fontSize: 12, fontWeight: 600,
                color: copied ? "white" : "#7c3aed",
              }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1" style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }} />
            <span style={{ fontSize: 11, color: t.textMuted }}>Suas credenciais da API</span>
            <div className="flex-1" style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }} />
          </div>

          <div>
            <FieldLabel t={t}>
              <span className="flex items-center gap-1.5">
                <KeyRound size={11} style={{ color: "#7c3aed" }} />
                Token de Acesso Permanente
              </span>
            </FieldLabel>
            <StyledInput
              value={form.accessToken}
              onChange={v => setForm(f => ({ ...f, accessToken: v }))}
              placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxx..."
              t={t}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel t={t}>
                <span className="flex items-center gap-1.5">
                  <Hash size={11} style={{ color: "#7c3aed" }} />
                  Phone Number ID
                </span>
              </FieldLabel>
              <StyledInput
                value={form.phoneNumberId}
                onChange={v => setForm(f => ({ ...f, phoneNumberId: v }))}
                placeholder="123456789012345"
                t={t}
              />
            </div>
            <div>
              <FieldLabel t={t}>App ID</FieldLabel>
              <StyledInput
                value={form.appId}
                onChange={v => setForm(f => ({ ...f, appId: v }))}
                placeholder="1234567890"
                t={t}
              />
            </div>
          </div>

          <div>
            <FieldLabel t={t}>
              <span className="flex items-center gap-1.5">
                <Building2 size={11} style={{ color: "#7c3aed" }} />
                Business Account ID (WABA)
              </span>
            </FieldLabel>
            <StyledInput
              value={form.businessAccountId}
              onChange={v => setForm(f => ({ ...f, businessAccountId: v }))}
              placeholder="987654321098765"
              t={t}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: saved
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #ec4899, #7c3aed)",
                border: "none", fontSize: 13, fontWeight: 600, color: "white",
                boxShadow: saved
                  ? "0 4px 16px rgba(16,185,129,0.35)"
                  : "0 4px 16px rgba(124,58,237,0.35)",
                transition: "all 0.3s ease",
              }}>
              {saved ? <Check size={14} /> : <Check size={14} />}
              {saved ? "Salvo com sucesso!" : "Salvar credenciais"}
            </button>
          </div>
        </div>
      </motion.div>

      {["Salesforce CRM", "HubSpot", "Zapier"].map((name, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb",
            opacity: 0.55,
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
          }}>
            <Link size={15} style={{ color: t.textMuted }} />
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 14, fontWeight: 600, color: t.textSecondary }}>{name}</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Em breve</div>
          </div>
          <span className="px-2.5 py-1 rounded-full" style={{
            fontSize: 11, fontWeight: 600,
            background: isDark ? "rgba(124,58,237,0.12)" : "#ede9fe",
            border: isDark ? "1px solid rgba(124,58,237,0.2)" : "1px solid #ddd6fe",
            color: "#7c3aed",
          }}>Em breve</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function Configuracoes() {
  const { t, mode } = useTheme();
  const { user } = useAuth();
  const isDark = mode === "dark";
  const [activeMenu, setActiveMenu] = useState("WhatsApp");
  const [showHelp, setShowHelp] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "Usuário";
  const displayEmail = user?.email || "—";
  const displayCompany = "YouAtende";
  const initials = displayName.split(" ").slice(0,2).map((n:string)=>n[0]?.toUpperCase()||"").join("");

  const btnPrimary = {
    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
    border: "none", color: "white", fontSize: 13, fontWeight: 600,
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
  } as React.CSSProperties;

  return (
    <>
    <div className="h-full flex gap-3 overflow-hidden">
      {/* Left Menu */}
      <div className="flex flex-col overflow-hidden py-4 px-3"
        style={{ ...t.panel, width: 220, flexShrink: 0 }}>
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
                  border: active
                    ? (isDark ? `1px solid ${item.color}30` : "1px solid #e5e7eb")
                    : "1px solid transparent",
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: active
                    ? (isDark ? `${item.color}22` : "#f3f4f6")
                    : (isDark ? "rgba(255,255,255,0.06)" : "transparent"),
                  border: `1px solid ${active ? (isDark ? item.color + "40" : "#e5e7eb") : t.border}`,
                }}>
                  <item.icon size={14} style={{ color: active ? (isDark ? item.color : "#374151") : t.textMuted }} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? (isDark ? item.color : "#111827") : t.textSecondary,
                }}>
                  {item.label}
                </span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: isDark ? item.color : "#9ca3af" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative" style={t.panel}>
        <div className="h-full scrollbar-glass px-6 py-5 overflow-y-auto">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeMenu === "WhatsApp"    && <WhatsAppSection t={t} isDark={isDark} />}
            {activeMenu === "Integrações" && <IntegracoesSection t={t} isDark={isDark} onShowHelp={() => setShowHelp(true)} />}
            {activeMenu === "Equipes"     && <TeamManagement />}

            {activeMenu === "Perfil" && (
              <div className="flex flex-col gap-5">
                <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>Perfil</h3>
                <div className="flex items-center gap-5 p-5 rounded-2xl" style={t.panelSubtle}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid #ede9fe",
                    fontSize: 26, fontWeight: 700,
                    boxShadow: isDark ? "0 4px 20px rgba(124,58,237,0.3)" : "0 2px 12px rgba(124,58,237,0.2)",
                  }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary }}>{displayName}</div>
                    <div style={{ fontSize: 13, color: t.textSecondary }}>{user?.role === "admin" ? "Administrador" : "Atendente"} · {displayCompany}</div>
                    <button className="mt-2 px-4 py-1.5 rounded-full transition-all hover:scale-105"
                      style={{ background: t.tagBg, border: `1px solid ${t.tagBorder}`, fontSize: 12, color: t.tagColor }}>
                      Alterar foto
                    </button>
                  </div>
                </div>
                {[
                  { label: "Nome completo", value: displayName,   type: "text"  },
                  { label: "E-mail",        value: displayEmail,  type: "email" },
                  { label: "Telefone",      value: "+55 (11) 99999-0000", type: "tel" },
                  { label: "Cargo",         value: user?.role==="admin"?"Administrador":"Atendente", type: "text" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block mb-1.5" style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>
                      {field.label}
                    </label>
                    <input type={field.type} defaultValue={field.value}
                      className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
                      style={{ ...t.panelInput, color: t.textPrimary, fontSize: 13 }} />
                  </div>
                ))}
                <button className="self-start flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:scale-105"
                  style={btnPrimary}>
                  <Check size={14} /> Salvar alterações
                </button>
              </div>
            )}

            {activeMenu === "Notificações" && (
              <div className="flex flex-col gap-3">
                <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>Notificações</h3>
                {[
                  { label: "Novas mensagens",           desc: "Receber notificações ao receber mensagens",        value: true  },
                  { label: "Menções",                   desc: "Receber alertas quando for mencionado",            value: true  },
                  { label: "Transferências de ticket",  desc: "Notificar ao receber tickets transferidos",        value: false },
                  { label: "Som de notificações",       desc: "Reproduzir som ao receber alertas",               value: true  },
                  { label: "Notificações do navegador", desc: "Habilitar notificações push",                     value: false },
                  { label: "E-mail resumo diário",      desc: "Receber relatório diário por e-mail",             value: true  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={t.panelSubtle}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: t.textPrimary }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>{item.desc}</div>
                    </div>
                    <GlassToggleSimple initial={item.value} />
                  </div>
                ))}
              </div>
            )}

            {!["Perfil","Notificações","WhatsApp","Integrações","Equipes"].includes(activeMenu) && (
              <div className="flex flex-col items-center justify-center py-20" style={{ color: t.textMuted }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{
                  background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.12))",
                  border: "1px solid rgba(124,58,237,0.15)",
                }}>
                  {(() => {
                    const Icon = menuItems.find(m => m.label === activeMenu)?.icon;
                    return Icon ? <Icon size={28} style={{ color: "#7c3aed" }} /> : null;
                  })()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.textSecondary }}>Em desenvolvimento</div>
                <div style={{ fontSize: 13, marginTop: 4, color: t.textMuted }}>Esta seção estará disponível em breve.</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>

    <AnimatePresence>
      {showHelp && (
        <MetaPartnerModal onClose={() => setShowHelp(false)} isDark={isDark} />
      )}
    </AnimatePresence>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
  </>
  );
}
