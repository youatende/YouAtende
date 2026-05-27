import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Megaphone, Plus, Play, Pause, MoreVertical,
  Users, CheckCircle, TrendingUp, Calendar, Edit3,
  Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  listCampaigns, startCampaign, pauseCampaign, deleteCampaign,
  Campaign, CampaignStatus,
} from "../../services/campaignsService";

/* ── Mock data ── */
const mockCampaigns = [
  { id:1, name:"Black Friday 2026",             status:"processing" as CampaignStatus, message1:"Promoção imperdível!", contactList:{ id:1, name:"Clientes VIP",  contactsCount:1250 }, shipments:[], scheduledAt:undefined, completedAt:undefined, whatsapp:{ id:1, name:"Canal Suporte" } },
  { id:2, name:"Boas-vindas Novos Clientes",    status:"paused"     as CampaignStatus, message1:"Seja bem-vindo!",     contactList:{ id:2, name:"Novos Clientes",contactsCount:345  }, shipments:[], scheduledAt:undefined, completedAt:undefined, whatsapp:{ id:1, name:"Canal Suporte" } },
  { id:3, name:"Pesquisa de Satisfação",        status:"finished"   as CampaignStatus, message1:"Avalie nosso atendimento", contactList:{ id:3, name:"Todos Clientes",contactsCount:890 }, shipments:[], scheduledAt:undefined, completedAt:undefined, whatsapp:{ id:1, name:"Canal Suporte" } },
  { id:4, name:"Promoção Semana do Consumidor", status:"scheduled"  as CampaignStatus, message1:"Semana do consumidor!", contactList:{ id:4, name:"Newsletter",  contactsCount:2100 }, shipments:[], scheduledAt:"2026-04-15T10:00:00.000Z", completedAt:undefined, whatsapp:{ id:1, name:"Canal Suporte" } },
];

/* ── Status config ── */
const statusConfig: Record<string, { label:string; color:string; lightColor:string; bg:string; lightBg:string }> = {
  processing: { label:"Ativa",      color:"#16a34a", lightColor:"#16a34a", bg:"rgba(134,239,172,0.15)", lightBg:"rgba(22,163,74,0.08)" },
  paused:     { label:"Pausada",    color:"#d97706", lightColor:"#d97706", bg:"rgba(251,191,36,0.15)",  lightBg:"rgba(217,119,6,0.08)"  },
  finished:   { label:"Finalizada", color:"#7c3aed", lightColor:"#7c3aed", bg:"rgba(167,139,250,0.15)", lightBg:"rgba(124,58,237,0.08)" },
  scheduled:  { label:"Agendada",   color:"#0284c7", lightColor:"#0284c7", bg:"rgba(125,211,252,0.15)", lightBg:"rgba(2,132,199,0.08)"  },
  inactive:   { label:"Inativa",    color:"#6b7280", lightColor:"#6b7280", bg:"rgba(156,163,175,0.15)", lightBg:"rgba(107,114,128,0.08)"},
  canceled:   { label:"Cancelada",  color:"#ef4444", lightColor:"#ef4444", bg:"rgba(252,165,165,0.15)", lightBg:"rgba(239,68,68,0.08)"  },
};

/* ── Campaign metrics from shipments ── */
function getCampaignMetrics(c: Campaign) {
  const total   = c.contactList?.contactsCount || 0;
  const sent    = c.shipments?.length || 0;
  const delivered = c.shipments?.filter(s => s.deliveredAt).length || 0;
  const read    = c.shipments?.filter(s => s.confirmationAt).length || 0;
  return { total, sent, delivered, read };
}

export function Campanhas() {
  const { t, mode } = useTheme();
  const { isDemo } = useAuth();
  const isDark = mode === "dark";

  const [campaigns, setCampaigns]   = useState<Campaign[]>(mockCampaigns as Campaign[]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string|null>(null);

  const load = useCallback(async () => {
    if (isDemo) { setCampaigns(mockCampaigns as Campaign[]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await listCampaigns();
      setCampaigns(res.records.length > 0 ? res.records : mockCampaigns as Campaign[]);
    } catch {
      setError("Não foi possível carregar as campanhas.");
      setCampaigns(mockCampaigns as Campaign[]);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (c: Campaign) => {
    const isRunning = c.status === "processing";
    // Optimistic update
    setCampaigns(prev => prev.map(x => x.id===c.id ? {...x, status: isRunning ? "paused" : "processing"} : x));
    if (isDemo) return;
    try {
      if (isRunning) await pauseCampaign(c.id);
      else await startCampaign(c.id);
    } catch { load(); }
  };

  const handleDelete = async (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    if (isDemo) return;
    try { await deleteCampaign(id); } catch { load(); }
  };

  const totalContacts = campaigns.reduce((s,c) => s + (c.contactList?.contactsCount||0), 0);
  const totalSent     = campaigns.reduce((s,c) => s + (c.shipments?.length||0), 0);
  const totalRead     = campaigns.reduce((s,c) => s + (c.shipments?.filter(sh=>sh.confirmationAt).length||0), 0);
  const avgReadRate   = totalSent > 0 ? Math.round((totalRead/totalSent)*100) : 0;

  const btnPrimary = { background:"linear-gradient(135deg,#ec4899,#7c3aed)", border:"none", color:"white", fontSize:13, boxShadow:"0 4px 16px rgba(124,58,237,0.35)" } as React.CSSProperties;
  const btnGhost   = { background:isDark?"rgba(255,255,255,0.08)":"rgba(124,58,237,0.06)", border:`1px solid ${t.borderStrong}`, color:t.textSecondary } as React.CSSProperties;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={t.panel}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:t.divider }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, color:t.textPrimary }}>Campanhas</h2>
          <p style={{ fontSize:13, color:t.textSecondary }}>Gerencie suas campanhas de mensagem</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={btnGhost}>
            {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <RefreshCw size={15}/>}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105" style={btnPrimary}>
            <Plus size={14}/><span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4">
        {[
          { label:"Total de Contatos",  value:totalContacts.toLocaleString("pt-BR"), icon:Users,        color:"#7c3aed" },
          { label:"Mensagens Enviadas", value:totalSent.toLocaleString("pt-BR"),     icon:CheckCircle,  color:"#ec4899" },
          { label:"Taxa de Leitura",    value:`${avgReadRate}%`,                     icon:TrendingUp,   color:"#10b981" },
          { label:"Campanhas Ativas",   value:campaigns.filter(c=>c.status==="processing").length.toString(), icon:Megaphone, color:"#f59e0b" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
            className="px-4 py-3 rounded-2xl flex items-center gap-3" style={t.panelSubtle}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${stat.color}18`, border:`1px solid ${stat.color}30` }}>
              <stat.icon size={18} style={{ color:stat.color }}/>
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, lineHeight:1, color:t.textPrimary }}>{stat.value}</div>
              <div style={{ fontSize:11, color:t.textSecondary }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background:isDark?"rgba(239,68,68,0.1)":"#fef2f2", border:"1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={13} style={{ color:"#ef4444", flexShrink:0 }}/><span style={{ fontSize:12, color:"#ef4444" }}>{error}</span>
        </div>
      )}

      {/* Campaign List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-glass">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} style={{ color:"#7c3aed", animation:"spin 1s linear infinite" }}/>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {campaigns.map((campaign, i) => {
              const sc     = statusConfig[campaign.status] || statusConfig.inactive;
              const color  = ["#7c3aed","#ec4899","#0ea5e9","#10b981"][i % 4];
              const { total, sent, delivered, read } = getCampaignMetrics(campaign);
              const readRate  = sent > 0 ? Math.round((read/sent)*100)      : 0;
              const delivRate = sent > 0 ? Math.round((delivered/sent)*100) : 0;

              return (
                <motion.div key={campaign.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                  className="p-5 rounded-2xl"
                  style={{ background:isDark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.7)", border:`1px solid ${t.border}`,
                    boxShadow:isDark?"none":"0 2px 12px rgba(124,58,237,0.05)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background:`${color}18`, border:`1px solid ${color}35` }}>
                        <Megaphone size={18} style={{ color }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:600, color:t.textPrimary }}>{campaign.name}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span style={{ fontSize:12, color:t.textMuted }}>WhatsApp</span>
                          {campaign.scheduledAt && (
                            <span className="flex items-center gap-1" style={{ fontSize:12, color:t.textMuted }}>
                              <Calendar size={11}/>
                              {new Date(campaign.scheduledAt).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {campaign.contactList && (
                            <span style={{ fontSize:12, color:t.textMuted }}>
                              {(campaign.contactList.contactsCount||0).toLocaleString("pt-BR")} contatos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full"
                        style={{ fontSize:12, fontWeight:600, color:sc.color, background:isDark?sc.bg:sc.lightBg, border:`1px solid ${sc.color}30` }}>
                        {sc.label}
                      </span>
                      {(campaign.status==="processing"||campaign.status==="paused") && (
                        <button onClick={() => handleToggle(campaign)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={btnGhost}>
                          {campaign.status==="processing" ? <Pause size={13}/> : <Play size={13}/>}
                        </button>
                      )}
                      {[Edit3, MoreVertical].map((Icon, idx) => (
                        <button key={idx} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={btnGhost}>
                          <Icon size={13}/>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label:"Enviadas",  value:sent,      total, pct:undefined, color:"#7c3aed" },
                      { label:"Entregues", value:delivered, total, pct:delivRate,  color:"#ec4899" },
                      { label:"Lidas",     value:read,      total, pct:readRate,   color:"#10b981" },
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize:11, color:t.textMuted }}>{metric.label}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:t.textSecondary }}>
                            {metric.value.toLocaleString("pt-BR")}
                            {metric.pct !== undefined && <span style={{ fontSize:11, color:metric.color, marginLeft:4 }}>({metric.pct}%)</span>}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:isDark?"rgba(255,255,255,0.1)":"rgba(124,58,237,0.08)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width:`${metric.total>0?(metric.value/metric.total)*100:0}%`,
                              background:`linear-gradient(90deg,${metric.color}cc,${metric.color})`,
                              boxShadow:isDark?`0 0 8px ${metric.color}55`:"none" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
