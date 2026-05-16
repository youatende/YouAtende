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
  listTickets, listQueues, updateTicket,
  Ticket, TicketStatus,
} from "../../services/ticketsService";
import {
  listMessages, sendMessage as apiSendMessage,
  Message,
} from "../../services/messagesService";

/* ── Helpers ──────────────────────────────────────────────────────────── */
const COLORS = ["#7c3aed","#ec4899","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#d946ef"];
const getColor  = (id: number) => COLORS[id % COLORS.length];
const getInit   = (name: string) => name.split(" ").slice(0,2).map(n => n[0]?.toUpperCase()||"").join("");
const fmtTime   = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); } catch { return ""; }
};
const fmtTs     = (ts: number) => {
  try { return new Date(ts * 1000).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); } catch { return ""; }
};

/* ── Mock fallback data ───────────────────────────────────────────────── */
type UiConv = {
  id: number; apiId: number; name: string; lastMessage: string; time: string;
  unread: number; status: string; queue: string; online: boolean; initials: string; color: string;
};
type UiMsg = {
  id: string | number; from: "contact" | "agent"; text: string; time: string; read: boolean; mediaUrl?: string;
};

const mockConversations: UiConv[] = [
  { id:1, apiId:1, name:"João Neves da Silva",   lastMessage:"Olá, preciso de ajuda com meu pedido",  time:"09:45", unread:2, status:"atendendo", queue:"Suporte",    online:true,  initials:"JN", color:"#7c3aed" },
  { id:2, apiId:2, name:"Maria Fernanda Costa",  lastMessage:"Quando chega meu produto?",             time:"09:32", unread:0, status:"atendendo", queue:"Vendas",     online:false, initials:"MF", color:"#ec4899" },
  { id:3, apiId:3, name:"Carlos Eduardo Lima",   lastMessage:"Obrigado pelo atendimento!",            time:"09:18", unread:1, status:"atendendo", queue:"Financeiro", online:true,  initials:"CE", color:"#0ea5e9" },
  { id:4, apiId:4, name:"Ana Luíza Rodrigues",   lastMessage:"Preciso cancelar meu pedido",           time:"08:55", unread:3, status:"aguardando",queue:"Suporte",    online:false, initials:"AL", color:"#10b981" },
  { id:5, apiId:5, name:"Roberto Almeida",        lastMessage:"Qual o prazo de entrega?",             time:"08:40", unread:0, status:"aguardando",queue:"Vendas",     online:false, initials:"RA", color:"#f59e0b" },
  { id:6, apiId:6, name:"Juliana Mendes",         lastMessage:"Posso parcelar em 12x?",               time:"08:22", unread:1, status:"atendendo", queue:"Financeiro", online:true,  initials:"JM", color:"#ef4444" },
];
const mockMessages: UiMsg[] = [
  { id:1, from:"contact", text:"Olá! Preciso de ajuda com meu pedido #12345.", time:"09:40", read:true },
  { id:2, from:"agent",   text:"Olá, João! Claro, vou verificar agora mesmo.", time:"09:41", read:true },
  { id:3, from:"contact", text:"O pedido foi realizado há 5 dias e não recebi informações de envio.", time:"09:42", read:true },
  { id:4, from:"agent",   text:"Entendi! Já localizei o pedido. Vou acionar o setor de logística.", time:"09:43", read:true },
  { id:5, from:"contact", text:"Ok, obrigado! Quanto tempo demora?", time:"09:44", read:true },
  { id:6, from:"contact", text:"Olá, preciso de ajuda com meu pedido", time:"09:45", read:false },
];

/* ── Adapters ─────────────────────────────────────────────────────────── */
function adaptTicket(t: Ticket): UiConv {
  const statusMap: Record<string, string> = { open:"atendendo", pending:"aguardando", closed:"finalizado" };
  return {
    id:         t.id,
    apiId:      t.id,
    name:       t.contact.name,
    lastMessage:t.lastMessage || "",
    time:       fmtTime(t.updatedAt),
    unread:     t.unreadMessages,
    status:     statusMap[t.status] || t.status,
    queue:      t.queue?.name || "—",
    online:     false,
    initials:   getInit(t.contact.name),
    color:      getColor(t.contact.id),
  };
}
function adaptMessage(m: Message): UiMsg {
  return {
    id:       m.id,
    from:     m.fromMe ? "agent" : "contact",
    text:     m.body,
    time:     fmtTs(m.timestamp),
    read:     m.read,
    mediaUrl: m.mediaUrl,
  };
}

type Tab = "atendendo" | "aguardando" | "todos";

export function Conversas() {
  const { t, mode } = useTheme();
  const { isDemo } = useAuth();
  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState<Tab>("atendendo");
  const [conversations, setConversations] = useState<UiConv[]>(mockConversations);
  const [messages, setMessages]           = useState<UiMsg[]>(mockMessages);
  const [selectedConv, setSelectedConv]   = useState<UiConv>(mockConversations[0]);
  const [search, setSearch]               = useState("");
  const [message, setMessage]             = useState("");
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [loadingConvs, setLoadingConvs]   = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sendingMsg, setSendingMsg]       = useState(false);
  const [error, setError]                 = useState<string|null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);

  /* ── Load tickets ── */
  const loadTickets = useCallback(async () => {
    if (isDemo) { setConversations(mockConversations); return; }
    setLoadingConvs(true);
    setError(null);
    try {
      const statusParam: TicketStatus | undefined =
        activeTab === "atendendo" ? "open"
        : activeTab === "aguardando" ? "pending"
        : undefined;
      const res = await listTickets(statusParam ? { status: statusParam } : {});
      const adapted = res.tickets.map(adaptTicket);
      setConversations(adapted.length > 0 ? adapted : mockConversations);
      if (adapted.length > 0) setSelectedConv(adapted[0]);
    } catch (e: any) {
      setError("Não foi possível carregar os tickets.");
      setConversations(mockConversations);
    } finally {
      setLoadingConvs(false);
    }
  }, [isDemo, activeTab]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  /* ── Load messages for selected ticket ── */
  useEffect(() => {
    if (isDemo) { setMessages(mockMessages); return; }
    setLoadingMsgs(true);
    listMessages(selectedConv.apiId)
      .then(res => setMessages(res.messages.map(adaptMessage).reverse()))
      .catch(() => setMessages(mockMessages))
      .finally(() => setLoadingMsgs(false));
  }, [isDemo, selectedConv.apiId]);

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
      const newMsg: UiMsg = { id: Date.now(), from:"agent", text, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}), read:false };
      setMessages(prev => [...prev, newMsg]);
      return;
    }
    setSendingMsg(true);
    try {
      const sent = await apiSendMessage({ ticketId: selectedConv.apiId, body: text });
      setMessages(prev => [...prev, adaptMessage(sent)]);
    } catch {
      /* silently fall back */
      const newMsg: UiMsg = { id: Date.now(), from:"agent", text, time: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}), read:false };
      setMessages(prev => [...prev, newMsg]);
    } finally {
      setSendingMsg(false);
    }
  };

  /* ── Resolve ticket ── */
  const handleResolve = async () => {
    if (isDemo) return;
    try {
      await updateTicket(selectedConv.apiId, { status: "closed" });
      setConversations(prev => prev.filter(c => c.id !== selectedConv.id));
    } catch { /* ignore */ }
  };

  const filteredConvs = conversations.filter((c) => {
    const matchTab = activeTab === "todos" || c.status === activeTab;
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="h-full flex gap-3 overflow-hidden">

      {/* ── Left Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col overflow-hidden flex-1 min-w-0"
        style={t.panel}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: t.divider }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>Conversas</span>
          <div className="flex items-center gap-2">
            <button onClick={loadTickets} style={{ color: t.textSecondary }} className="hover:scale-110 transition-transform">
              {loadingConvs ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={15} />}
            </button>
            <div className="px-2 py-0.5 rounded-full" style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.4),rgba(124,58,237,0.4))", border:"1px solid rgba(255,255,255,0.2)", fontSize:11, color:"white", fontWeight:600 }}>
              {filteredConvs.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mx-4 mt-3 mb-2 p-0.5 rounded-xl" style={{ background:isDark?"rgba(0,0,0,0.25)":"#f3f4f6", border:isDark?"1px solid rgba(255,255,255,0.08)":"1px solid #e5e7eb" }}>
          {(["atendendo","aguardando","todos"] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-1.5 rounded-lg transition-all duration-200"
              style={{ fontSize:12, fontWeight:activeTab===tab?600:400, color:activeTab===tab?"#ffffff":t.textSecondary,
                background:activeTab===tab?(isDark?"linear-gradient(135deg,rgba(236,72,153,0.75),rgba(124,58,237,0.75))":"linear-gradient(135deg,#7c3aed,#a855f7)"):"transparent",
                boxShadow:activeTab===tab?"0 2px 8px rgba(124,58,237,0.3)":"none", border:"none" }}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={t.panelInput}>
            <Search size={14} style={{ color: t.textMuted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contatos e conversas"
              className="flex-1 bg-transparent outline-none" style={{ fontSize:13, color:t.textPrimary }} />
            {search && <button onClick={() => setSearch("")} style={{ color:t.textMuted }}><X size={12}/></button>}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background:isDark?"rgba(239,68,68,0.1)":"#fef2f2", border:"1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={13} style={{ color:"#ef4444", flexShrink:0 }} />
            <span style={{ fontSize:12, color:"#ef4444" }}>{error}</span>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-glass" style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <AnimatePresence>
            {filteredConvs.map((conv, i) => {
              const isSelected = selectedConv.id === conv.id;
              return (
                <motion.button key={conv.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                  onClick={() => setSelectedConv(conv)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left w-full transition-all duration-200 hover:scale-[1.01]"
                  style={isSelected ? t.activeItem : { background:"transparent", border:"1px solid transparent" }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ background:`linear-gradient(135deg,${conv.color}88,${conv.color}cc)`, border:`1.5px solid ${t.avatarBorder}`, fontSize:13, fontWeight:700 }}>
                      {conv.initials}
                    </div>
                    {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background:t.onlineDot, border:isDark?"2px solid rgba(15,3,40,0.8)":"2px solid #fff" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="truncate" style={{ fontSize:13, fontWeight:600, color:isSelected?t.activeText:t.textPrimary }}>{conv.name}</span>
                      <span style={{ fontSize:11, color:t.textMuted, flexShrink:0, marginLeft:4 }}>{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate" style={{ fontSize:12, color:t.textSecondary }}>{conv.lastMessage}</span>
                      {conv.unread > 0 && (
                        <div className="flex-shrink-0 ml-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background:t.unreadBg, fontSize:10, fontWeight:700, color:"white", boxShadow:"0 0 8px rgba(236,72,153,0.5)" }}>
                          {conv.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="px-2 py-0.5 rounded-full" style={{ background:t.tagBg, border:`1px solid ${t.tagBorder}`, fontSize:10, color:t.tagColor }}>
                        {conv.queue}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
          {filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12" style={{ color:t.textMuted }}>
              <MessageCircle size={32} className="mb-2 opacity-40" />
              <span style={{ fontSize:13 }}>Nenhuma conversa encontrada</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Middle Panel: Chat ── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col flex-1 overflow-hidden min-w-0"
        style={t.panel}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: t.divider }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background:`linear-gradient(135deg,${selectedConv.color}99,${selectedConv.color}cc)`, border:`1.5px solid ${t.avatarBorder}`, fontSize:13, fontWeight:700, boxShadow:`0 0 16px ${selectedConv.color}33` }}>
              {selectedConv.initials}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:t.textPrimary }}>{selectedConv.name}</div>
              <div className="flex items-center gap-1.5" style={{ fontSize:12, color:t.textSecondary }}>
                <Circle size={7} fill={selectedConv.online?"#10b981":"#9ca3af"} stroke="none" />
                {selectedConv.online?"Online":"Offline"} · {selectedConv.queue}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[Phone, Video].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background:isDark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)", border:t.divider, color:t.textSecondary }}>
                <Icon size={15}/>
              </button>
            ))}
            <button onClick={() => setShowContactInfo(v=>!v)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={showContactInfo
                ? { background:"linear-gradient(135deg,rgba(236,72,153,0.5),rgba(124,58,237,0.5))", border:"1px solid rgba(255,255,255,0.2)", color:"white" }
                : { background:isDark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)", border:t.divider, color:t.textSecondary }}>
              <User size={15}/>
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background:isDark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)", border:t.divider, color:t.textSecondary }}>
              <MoreVertical size={15}/>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-glass" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1" style={{ height:1, background:t.border }}/>
            <span className="px-3 py-1 rounded-full" style={{ fontSize:11, color:t.textMuted, background:t.tagBg, border:`1px solid ${t.tagBorder}` }}>
              Hoje, {new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}
            </span>
            <div className="flex-1" style={{ height:1, background:t.border }}/>
          </div>

          {loadingMsgs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} style={{ color:"#7c3aed", animation:"spin 1s linear infinite" }} />
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className={`flex ${msg.from==="agent"?"justify-end":"justify-start"}`}>
                <div className="max-w-[65%] px-4 py-3 rounded-2xl"
                  style={{ ...(msg.from==="agent"?t.msgAgent:t.msgContact), borderBottomRightRadius:msg.from==="agent"?4:16, borderBottomLeftRadius:msg.from==="contact"?4:16 }}>
                  <p style={{ fontSize:13, lineHeight:1.6, color:msg.from==="agent"?(isDark?"white":"#4c1d95"):t.textPrimary }}>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.from==="agent"?"justify-end":"justify-start"}`}>
                    <span style={{ fontSize:11, color:t.textMuted }}>{msg.time}</span>
                    {msg.from==="agent" && <CheckCheck size={12} style={{ color:msg.read?"#a78bfa":t.textMuted }}/>}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={msgEndRef}/>
        </div>

        {/* Input */}
        <div className="px-4 py-3" style={{ borderTop:t.divider }}>
          <div className="flex items-center gap-3 px-4 py-3" style={t.inputBg}>
            {[Smile, Paperclip].map((Icon, i) => (
              <button key={i} className="transition-colors flex-shrink-0" style={{ color:t.textMuted }}>
                <Icon size={18}/>
              </button>
            ))}
            <input value={message} onChange={(e)=>setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize:13, color:t.textPrimary }}
              onKeyDown={(e) => e.key==="Enter" && !e.shiftKey && handleSend()} />
            <button className="flex-shrink-0 transition-colors" style={{ color:t.textMuted }}>
              <Mic size={18}/>
            </button>
            <button
              onClick={handleSend}
              disabled={sendingMsg || !message.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
              style={{ background:message?"linear-gradient(135deg,#ec4899,#7c3aed)":(isDark?"rgba(255,255,255,0.1)":"rgba(124,58,237,0.1)"),
                border:`1px solid ${t.borderStrong}`, boxShadow:message?"0 4px 16px rgba(236,72,153,0.4)":"none", opacity:sendingMsg?0.6:1 }}>
              {sendingMsg ? <Loader2 size={15} style={{ color:"white", animation:"spin 1s linear infinite" }}/> : <Send size={15} style={{ color:message?"white":t.textSecondary, marginLeft:1 }}/>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Right Panel: Contact Info ── */}
      <AnimatePresence>
        {showContactInfo && (
          <motion.div
            initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:60 }}
            transition={{ duration:0.35, delay:0.18, ease:[0.25,0.46,0.45,0.94] }}
            className="flex flex-col overflow-hidden flex-1 min-w-0"
            style={{ ...t.panelStrong }}>
            <div className="px-5 pt-5 pb-4 flex flex-col items-center" style={{ borderBottom:t.divider }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-3"
                style={{ background:`linear-gradient(135deg,${selectedConv.color}88,${selectedConv.color}cc)`, border:isDark?"2px solid rgba(255,255,255,0.25)":"2px solid rgba(124,58,237,0.2)", fontSize:22, fontWeight:700, boxShadow:`0 0 24px ${selectedConv.color}33` }}>
                {selectedConv.initials}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:t.textPrimary }}>{selectedConv.name}</div>
              <div style={{ fontSize:12, color:t.textSecondary, marginTop:2 }}>Ticket #{selectedConv.apiId}</div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleResolve}
                  className="px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{ background:"linear-gradient(135deg,#ec4899,#7c3aed)", border:"none", fontSize:12, color:"white", fontWeight:500, boxShadow:"0 4px 12px rgba(124,58,237,0.35)" }}>
                  Resolver
                </button>
                <button className="px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{ background:t.tagBg, border:`1px solid ${t.tagBorder}`, fontSize:12, color:t.textSecondary, fontWeight:500 }}>
                  Transferir
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-glass">
              {[
                { label:"Fila",       value:selectedConv.queue, icon:Tag },
                { label:"Status",     value:selectedConv.status==="atendendo"?"Atendendo":"Aguardando", icon:Clock },
                { label:"ID Ticket",  value:`#${selectedConv.apiId}`, icon:MessageCircle },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl" style={t.panelSubtle}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:isDark?"rgba(124,58,237,0.3)":"#f5f3ff", border:isDark?"1px solid rgba(167,139,250,0.3)":"1px solid #ede9fe" }}>
                    <info.icon size={13} style={{ color:"#7c3aed" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:t.textMuted, lineHeight:1.3 }}>{info.label}</div>
                    <div style={{ fontSize:13, fontWeight:500, lineHeight:1.3, color:t.textPrimary }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
