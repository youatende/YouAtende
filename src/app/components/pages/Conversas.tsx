import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Send, Paperclip, Smile, Phone, Video, MoreVertical,
  CheckCheck, Clock, Circle, RefreshCw, User, Tag, MessageCircle,
  X, Mic, AlertCircle, Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  listContacts,
  getContactMessages,
  openTicket,
  closeTicket,
  Contact,
  Message,
} from "../../services/contactsService";
import { sendMessage as apiSendMessage } from "../../services/messagesService";

/* ── Helpers ──────────────────────────────────────────────────────────── */
const COLORS = [
  "#7c3aed", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#d946ef",
];
const getColor = (id: string) => COLORS[parseInt(id, 36) % COLORS.length];
const getInit = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

/* ── Types ────────────────────────────────────────────────────────────── */
type UiConv = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string; // "open" | "closed"
  queue: string;
  online: boolean;
  initials: string;
  color: string;
  ticketId?: string;
};

type UiMsg = {
  id: string | number;
  from: "contact" | "agent" | "system";
  text: string;
  time: string;
  read: boolean;
  mediaUrl?: string;
};

/* ── Mock fallback data ────────────────────────────────────────────────── */
const mockConversations: UiConv[] = [
  {
    id: "1", name: "João Neves da Silva", lastMessage: "Olá, preciso de ajuda com meu pedido",
    time: "09:45", unread: 2, status: "open", queue: "Suporte", online: true,
    initials: "JN", color: "#7c3aed", ticketId: "t1",
  },
  {
    id: "2", name: "Maria Fernanda Costa", lastMessage: "Quando chega meu produto?",
    time: "09:32", unread: 0, status: "open", queue: "Vendas", online: false,
    initials: "MF", color: "#ec4899", ticketId: "t2",
  },
  {
    id: "3", name: "Carlos Eduardo Lima", lastMessage: "Obrigado pelo atendimento!",
    time: "09:18", unread: 1, status: "open", queue: "Financeiro", online: true,
    initials: "CE", color: "#0ea5e9", ticketId: "t3",
  },
];

const mockMessages: UiMsg[] = [
  { id: 1, from: "contact", text: "Olá! Preciso de ajuda com meu pedido #12345.", time: "09:40", read: true },
  { id: 2, from: "agent", text: "Olá, João! Claro, vou verificar agora mesmo.", time: "09:41", read: true },
  { id: 3, from: "contact", text: "O pedido foi realizado há 5 dias e não recebi informações de envio.", time: "09:42", read: true },
  { id: 4, from: "agent", text: "Entendi! Já localizei o pedido. Vou acionar o setor de logística.", time: "09:43", read: true },
];

/* ── Adapters ──────────────────────────────────────────────────────────── */
function adaptContact(c: Contact): UiConv {
  return {
    id: c.id,
    name: c.name || c.phoneNumber,
    lastMessage: c.lastMessage || "",
    time: c.lastMessageAt ? fmtTime(c.lastMessageAt) : "",
    unread: 0,
    status: c.ticketStatus === "open" ? "open" : "closed",
    queue: "—",
    online: false,
    initials: getInit(c.name || c.phoneNumber),
    color: getColor(c.id),
    ticketId: c.ticketId,
  };
}

function adaptMessage(m: Message): UiMsg {
  if (m.isSystem) {
    return {
      id: m.id,
      from: "system",
      text: m.body,
      time: fmtTime(m.timestamp),
      read: true,
    };
  }
  return {
    id: m.id,
    from: m.fromMe ? "agent" : "contact",
    text: m.body,
    time: fmtTime(m.timestamp),
    read: m.ack === "read",
    mediaUrl: undefined,
  };
}

/* ── Component ─────────────────────────────────────────────────────────── */
export function Conversas() {
  const { t, mode } = useTheme();
  const { isDemo } = useAuth();
  const isDark = mode === "dark";

  const [conversations, setConversations] = useState<UiConv[]>(mockConversations);
  const [messages, setMessages] = useState<UiMsg[]>(mockMessages);
  const [selectedConv, setSelectedConv] = useState<UiConv>(mockConversations[0]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);

  /* ── Load contacts (conversations) ── */
  const loadContacts = useCallback(async () => {
    if (isDemo) {
      setConversations(mockConversations);
      return;
    }
    setLoadingConvs(true);
    setError(null);
    try {
      const contacts = await listContacts();
      const adapted = contacts.map(adaptContact);
      setConversations(adapted.length > 0 ? adapted : mockConversations);
      if (adapted.length > 0) setSelectedConv(adapted[0]);
    } catch (e: any) {
      setError("Não foi possível carregar os contatos.");
      setConversations(mockConversations);
    } finally {
      setLoadingConvs(false);
    }
  }, [isDemo]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  /* ── Load messages for selected contact ── */
  useEffect(() => {
    if (isDemo) {
      setMessages(mockMessages);
      return;
    }
    setLoadingMsgs(true);
    getContactMessages(selectedConv.id)
      .then((res) => setMessages(res.map(adaptMessage)))
      .catch(() => setMessages(mockMessages))
      .finally(() => setLoadingMsgs(false));
  }, [isDemo, selectedConv.id]);

  /* ── Scroll to bottom on new message ── */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ── */
  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    setMessage("");
    if (isDemo) {
      const newMsg: UiMsg = {
        id: Date.now(),
        from: "agent",
        text,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      return;
    }
    setSendingMsg(true);
    try {
      const sent = await apiSendMessage({ contactId: selectedConv.id, body: text });
      const newMsg: UiMsg = {
        id: sent.messageId,
        from: "agent",
        text,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setMessages((prev) => [...prev, newMsg]);
    } catch {
      const fallbackMsg: UiMsg = {
        id: Date.now(),
        from: "agent",
        text,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSendingMsg(false);
    }
  };

  /* ── Resolve (close ticket) ── */
  const handleResolve = async () => {
    if (isDemo) return;
    try {
      await closeTicket(selectedConv.id);
      setConversations((prev) => prev.filter((c) => c.id !== selectedConv.id));
    } catch {
      /* ignore */
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* ── Left Panel ── */}
      <div style={{ width: 360, borderRight: t.divider, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: t.divider }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: 0 }}>Conversas</h2>
          {loadingConvs ? (
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite", marginTop: 8 }} />
          ) : (
            <span style={{ fontSize: 12, color: t.textMuted, marginTop: 4, display: "block" }}>
              {filteredConvs.length} conversas
            </span>
          )}
        </div>

        {/* Search */}
        <div style={{ padding: "8px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.04)",
              border: t.divider,
            }}
          >
            <Search size={14} style={{ color: t.textMuted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contatos e conversas"
              style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: 13, color: t.textPrimary }}
            />
            {search && (
              <X
                size={14}
                style={{ color: t.textMuted, cursor: "pointer" }}
                onClick={() => setSearch("")}
              />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "8px 20px", color: "#ef4444", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Conversation List */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
          {filteredConvs.map((conv) => {
            const isSelected = selectedConv.id === conv.id;
            return (
              <motion.div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  marginBottom: 4,
                  ...(isSelected ? t.activeItem : { background: "transparent" }),
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${conv.color}, ${conv.color}88)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    position: "relative",
                  }}
                >
                  {conv.initials}
                  {conv.online && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 1,
                        right: 1,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #fff",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: t.textPrimary }}>{conv.name}</span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>{conv.time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: t.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                      {conv.lastMessage}
                    </span>
                    {conv.status === "open" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#fff",
                          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                          padding: "2px 8px",
                          borderRadius: 20,
                        }}
                      >
                        Aberto
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredConvs.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: t.textMuted, fontSize: 13 }}>
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </div>

      {/* ── Middle Panel: Chat ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Chat Header */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: t.divider,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${selectedConv.color}, ${selectedConv.color}88)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {selectedConv.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: t.textPrimary }}>{selectedConv.name}</div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                {selectedConv.online ? "Online" : "Offline"} · {selectedConv.queue}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[Phone, Video].map((Icon, i) => (
              <button
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={18} style={{ color: t.textSecondary }} />
              </button>
            ))}
            <button
              onClick={() => setShowContactInfo((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: showContactInfo
                  ? "1px solid rgba(255,255,255,0.2)"
                  : t.divider,
                cursor: "pointer",
                ...(showContactInfo
                  ? { background: "linear-gradient(135deg, rgba(236,72,153,0.5), rgba(124,58,237,0.5))", color: "white" }
                  : { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)" }),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {loadingMsgs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.from === "system"
                      ? "center"
                      : msg.from === "agent"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: 12,
                }}
              >
                {msg.from === "system" ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: t.textMuted,
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(124,58,237,0.05)",
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: t.divider,
                    }}
                  >
                    {msg.text}
                    <span style={{ marginLeft: 8, opacity: 0.7 }}>{msg.time}</span>
                  </div>
                ) : (
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 16px",
                      borderRadius: 16,
                      background:
                        msg.from === "agent"
                          ? isDark
                            ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                            : "linear-gradient(135deg, #7c3aed, #a855f7)"
                          : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(124,58,237,0.08)",
                      color:
                        msg.from === "agent" ? "#fff" : t.textPrimary,
                    }}
                  >
                    <div style={{ fontSize: 13 }}>{msg.text}</div>
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        justifyContent: "flex-end",
                      }}
                    >
                      <span>{msg.time}</span>
                      {msg.from === "agent" && (
                        msg.read ? <CheckCheck size={12} /> : <CheckCheck size={12} style={{ opacity: 0.5 }} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: t.divider }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 14,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.04)",
              border: t.divider,
            }}
          >
            {[Smile, Paperclip].map((Icon, i) => (
              <button
                key={i}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Icon size={18} style={{ color: t.textMuted }} />
              </button>
            ))}
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={{
                flex: 1,
                background: "transparent",
                outline: "none",
                border: "none",
                fontSize: 13,
                color: t.textPrimary,
              }}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            {sendingMsg ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <button
                onClick={handleSend}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={16} style={{ color: "#fff" }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Contact Info ── */}
      {showContactInfo && (
        <div style={{ width: 280, borderLeft: t.divider, padding: 20, overflow: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${selectedConv.color}, ${selectedConv.color}88)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 22,
                margin: "0 auto 12px",
              }}
            >
              {selectedConv.initials}
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, color: t.textPrimary }}>{selectedConv.name}</div>
            {selectedConv.ticketId && (
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                Ticket #{selectedConv.ticketId}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <button
              onClick={handleResolve}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
              }}
            >
              Resolver
            </button>
            <button
              style={{
                padding: "10px",
                borderRadius: 10,
                border: t.divider,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                background: "transparent",
                color: t.textPrimary,
              }}
            >
              Transferir
            </button>
          </div>

          {[
            { label: "Fila", value: selectedConv.queue, icon: Tag },
            { label: "Status", value: selectedConv.status === "open" ? "Atendendo" : "Finalizado", icon: Clock },
            { label: "ID Ticket", value: `#${selectedConv.ticketId ?? selectedConv.id}`, icon: MessageCircle },
          ].map((info) => (
            <div
              key={info.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: t.divider,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <info.icon size={14} style={{ color: t.textMuted }} />
                <span style={{ fontSize: 12, color: t.textMuted }}>{info.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>{info.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
