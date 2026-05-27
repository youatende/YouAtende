import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, Unplug, RefreshCw, Wifi, WifiOff,
  Smartphone, AlertCircle, Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  listConnections, createConnection, updateConnection,
  deleteConnection,
  connectSession, disconnectSession,
  WhatsAppSession
} from "../../services/whatsappService";
import { useWhatsAppWebSocket } from "../../hooks/useWhatsAppWebSocket";
import { WaModal } from "./WaModal";
import { WhatsappQrCard } from "./WhatsappQrCard";

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

function adaptConnection(w: WhatsAppSession): WaChannel {
  const statusMap: Record<string, "connected"|"disconnected"|"pending"> = {
    CONNECTED: "connected",
    starting: "pending",
    qr_code: "pending",
    PAIRING: "pending",
    OPENING: "pending",
  };
  return {
    id:           w.id,
    name:         w.name,
    phone:        w.phone_number || w.number || "",
    status:       statusMap[w.status] || "disconnected",
    lastUpdate:   w.updated_at ? new Date(w.updated_at).toLocaleString("pt-BR") : "—",
    default:      w.isDefault || false,
    typing:       false,
    recording:    false,
    token:        w.token || "",
    msgInactivity:"",
    msgConclusion: w.farewellMessage || "",
    msgOutOfHours: w.outOfHoursMessage || "",
    integration:  w.integration || "",
  };
}

function adaptToApi(ch: WaChannel): Partial<WhatsAppSession> {
  return {
    name:             ch.name,
    phone_number:     ch.phone,
    token:            ch.token,
    isDefault:        ch.default,
    farewellMessage:  ch.msgConclusion,
    outOfHoursMessage: ch.msgOutOfHours,
    integration:      ch.integration,
  };
}

export function WhatsAppSection({ t, isDark }: { t: any; isDark: boolean }) {
  const { isDemo } = useAuth();
  const [channels, setChannels] = useState<WaChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string|null>(null);
  const [modalChannel, setModalChannel] = useState<WaChannel | null | undefined>(undefined);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const loadChannels = useCallback(async () => {
    if (isDemo) { setChannels([]); return; }
    setLoading(true);
    setApiError(null);
    try {
      const conns = await listConnections();
      setChannels(conns.map(adaptConnection));
    } catch {
      setApiError("Não foi possível carregar as conexões.");
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  useWhatsAppWebSocket((event, data) => {
    console.log(`[WhatsApp] Evento recebido: ${event}`, data);
    if (event === "qr_code_ready") {
      const sessionId = data.sessionId;
      const qrcode = data.qrcode;
      const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcode)}`;
      setQrCodes(prev => ({ ...prev, [sessionId]: imageUrl }));
      console.log(`[WhatsApp] QR code definido para ${sessionId}`);
    } else if (event === "session_connected") {
      const sessionId = data.sessionId;
      setQrCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[sessionId];
        return newCodes;
      });
      loadChannels();
      console.log(`[WhatsApp] Sessão conectada: ${sessionId}`);
    } else if (event === "session_disconnected") {
      const sessionId = data.sessionId;
      console.log(`[WhatsApp] Sessão desconectada: ${sessionId}`);
      setChannels(prev =>
        prev.map(c => c.id === sessionId ? { ...c, status: "disconnected" } : c));
      setQrCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[sessionId];
        return newCodes;
      });
      loadChannels();
    }
  });

  const openNew    = () => setModalChannel(null);
  const openEdit   = (ch: WaChannel) => setModalChannel(ch);
  const closeModal = () => setModalChannel(undefined);

  const handleSave = async (ch: WaChannel) => {
    closeModal();
    if (isDemo) return;
    try {
      if (channels.find(c => c.id === ch.id)) {
        await updateConnection(ch.id, adaptToApi(ch));
        loadChannels();
      } else {
        await createConnection(adaptToApi(ch) as any);
        loadChannels();
      }
    } catch {
      setApiError("Erro ao salvar conexão.");
    }
  };

  const handleDelete = async (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
    if (isDemo) return;
    try { await deleteConnection(id); } catch { loadChannels(); }
  };

  const handleToggle = async (id: string) => {
    const channel = channels.find(c => c.id === id);
    if (!channel) return;

    console.log(`[WhatsApp] handleToggle: id=${id}, status atual=${channel.status}`);

    if (channel.status === "connected") {
      console.log("[WhatsApp] Desconectando...");
      try {
        await disconnectSession(id);
        console.log("[WhatsApp] DisconnectSession OK, recarregando...");
        loadChannels();
      } catch (err) {
        console.error("[WhatsApp] Erro ao desconectar:", err);
        setChannels(prev =>
          prev.map(c => c.id === id ? { ...c, status: "disconnected" } : c));
      }
      return;
    }

    if (channel.status === "disconnected") {
      console.log("[WhatsApp] Conectando...");
      setChannels(prev =>
        prev.map(c => c.id === id ? { ...c, status: "pending" } : c));
      try {
        await connectSession(id);
        console.log("[WhatsApp] ConnectSession OK, aguardando QR via WebSocket...");
      } catch (err) {
        console.error("[WhatsApp] Erro ao conectar:", err);
        setApiError("Erro ao iniciar a conexão.");
        setChannels(prev =>
          prev.map(c => c.id === id ? { ...c, status: "disconnected" } : c));
      }
      return;
    }

    if (channel.status === "pending") {
      console.log("[WhatsApp] Cancelando tentativa...");
      setChannels(prev =>
        prev.map(c => c.id === id ? { ...c, status: "disconnected" } : c));
      setQrCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[id];
        return newCodes;
      });
    }
  };

  const statusCfg = {
    connected:    { label: "Conectado",    color: "#10b981", bg: isDark ? "rgba(16,185,129,0.12)"  : "#f0fdf4", border: isDark ? "rgba(16,185,129,0.25)"  : "#bbf7d0", Icon: Wifi      },
    disconnected: { label: "Desconectado", color: "#ef4444", bg: isDark ? "rgba(239,68,68,0.12)"   : "#fef2f2", border: isDark ? "rgba(239,68,68,0.25)"   : "#fecaca", Icon: WifiOff   },
    pending:      { label: "Aguardando",   color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)"  : "#fffbeb", border: isDark ? "rgba(245,158,11,0.25)"  : "#fde68a", Icon: RefreshCw },
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Conexões WhatsApp</h3>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Gerencie seus canais via Official API (Meta)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadChannels}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)", border: `1px solid ${t.borderStrong}`, color: t.textSecondary }}>
            {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <RefreshCw size={15}/>}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              border: "none", fontSize: 13, fontWeight: 600, color: "white",
              boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
            }}>
            <Plus size={15} /> Nova Conexão
          </button>
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
          style={{ background: isDark?"rgba(239,68,68,0.1)":"#fef2f2", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} style={{ color:"#ef4444", flexShrink:0 }}/><span style={{ fontSize:12, color:"#ef4444" }}>{apiError}</span>
        </div>
      )}

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
            <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="px-5 py-4 rounded-2xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
              }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                  background: "linear-gradient(135deg, rgba(37,211,102,0.18), rgba(18,140,126,0.18))",
                  border: isDark ? "1px solid rgba(37,211,102,0.25)" : "1px solid #d1fae5",
                }}>
                  <Smartphone size={20} style={{ color: "#25D366" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{ch.name}</span>
                    {ch.default && <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 600, background: isDark ? "rgba(124,58,237,0.2)" : "#ede9fe", border: isDark ? "1px solid rgba(124,58,237,0.3)" : "1px solid #ddd6fe", color: "#7c3aed" }}>Padrão</span>}
                  </div>
                  <div style={{ fontSize: 13, color: t.textSecondary }}>{ch.phone}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Última atualização: {ch.lastUpdate}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <s.Icon size={12} style={{ color: s.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggle(ch.id)}
                    title={ch.status === "connected" ? "Desconectar" : ch.status === "pending" ? "Cancelar" : "Conectar"}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                      color: statusCfg[ch.status]?.color ?? "#10b981",
                      animation: ch.status === "pending" ? "pulse 1.5s infinite" : "none",
                    }}>
                    <Unplug size={13} />
                  </button>
                  <button onClick={() => openEdit(ch)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: isDark ? "rgba(124,58,237,0.12)" : "#f5f3ff", border: isDark ? "1px solid rgba(124,58,237,0.2)" : "1px solid #ede9fe", color: "#7c3aed" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(ch.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #fecaca", color: "#ef4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {qrCodes[ch.id] && (
                <WhatsappQrCard qrCodeUrl={qrCodes[ch.id]} isDark={isDark} t={t} />
              )}
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
