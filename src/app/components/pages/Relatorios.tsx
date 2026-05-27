import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { MessageCircle, CheckCircle, Clock, TrendingUp, Users, Star, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboardStats, getDailyStats,
  DashboardStats, DailyTicketStat,
} from "../../services/reportsService";

/* ── Mock data ── */
const mockAreaData = [
  { day:"Seg", atendidos:32, aguardando:8  },
  { day:"Ter", atendidos:45, aguardando:12 },
  { day:"Qua", atendidos:38, aguardando:6  },
  { day:"Qui", atendidos:52, aguardando:15 },
  { day:"Sex", atendidos:61, aguardando:9  },
  { day:"Sáb", atendidos:28, aguardando:4  },
  { day:"Dom", atendidos:18, aguardando:2  },
];
const mockPieData = [
  { name:"Resolvidos", value:68, color:"#7c3aed" },
  { name:"Pendentes",  value:18, color:"#ec4899" },
  { name:"Em Espera",  value:14, color:"#a78bfa" },
];
const mockBarData = [
  { name:"Suporte",    tickets:48 },
  { name:"Vendas",     tickets:37 },
  { name:"Financeiro", tickets:22 },
  { name:"Técnico",    tickets:15 },
];
const mockStats = {
  totalTickets:274, openTickets:68, pendingTickets:22, closedTickets:184,
  averageResponseTime:272, satisfaction:0.947, newContacts:61,
};

/* ── Adapters ── */
function adaptDailyStats(data: DailyTicketStat[]) {
  const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  return data.slice(-7).map(d => ({
    day: DAYS[new Date(d.date).getDay()] || d.date.slice(5),
    atendidos: d.closed || 0,
    aguardando: d.pending || 0,
  }));
}

function fmtTime(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function Relatorios() {
  const { t, mode } = useTheme();
  const { isDemo } = useAuth();
  const isDark = mode === "dark";

  const [stats, setStats]     = useState<DashboardStats>(mockStats);
  const [areaData, setAreaData] = useState(mockAreaData);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const load = useCallback(async () => {
    if (isDemo) { setStats(mockStats); setAreaData(mockAreaData); return; }
    setLoading(true);
    setError(null);
    try {
      const [dash, daily] = await Promise.all([getDashboardStats(), getDailyStats()]);
      setStats(dash);
      if (daily.length > 0) setAreaData(adaptDailyStats(daily));
    } catch {
      setError("Não foi possível carregar os relatórios.");
      setStats(mockStats);
      setAreaData(mockAreaData);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => { load(); }, [load]);

  const tickColor  = isDark ? "rgba(255,255,255,0.4)" : "#9e90c4";
  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)";

  const statCards = [
    { label:"Total de Tickets",  value:stats.totalTickets.toString(),                     change:"+12%", icon:MessageCircle, color:"#7c3aed" },
    { label:"Resolvidos",        value:stats.closedTickets.toString(),                    change:"+8%",  icon:CheckCircle,   color:"#10b981" },
    { label:"Tempo Médio",       value:fmtTime(stats.averageResponseTime||0),             change:"-18%", icon:Clock,         color:"#ec4899" },
    { label:"Satisfação",        value:stats.satisfaction ? `${(stats.satisfaction*100).toFixed(1)}%` : "—", change:"+2%", icon:Star, color:"#f59e0b" },
    { label:"Novos Contatos",    value:(stats.newContacts||0).toString(),                 change:"+22%", icon:Users,         color:"#0ea5e9" },
    { label:"Em Espera",         value:stats.pendingTickets.toString(),                   change:"+0.5%",icon:TrendingUp,    color:"#8b5cf6" },
  ];

  const pieData = [
    { name:"Resolvidos", value: stats.totalTickets > 0 ? Math.round((stats.closedTickets/stats.totalTickets)*100)  : 68, color:"#7c3aed" },
    { name:"Pendentes",  value: stats.totalTickets > 0 ? Math.round((stats.pendingTickets/stats.totalTickets)*100) : 18, color:"#ec4899" },
    { name:"Em Espera",  value: stats.totalTickets > 0 ? Math.round((stats.openTickets/stats.totalTickets)*100)    : 14, color:"#a78bfa" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:isDark?"rgba(15,3,40,0.92)":"rgba(255,255,255,0.97)", backdropFilter:"blur(16px)", border:`1px solid ${t.borderStrong}`, borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 24px rgba(124,58,237,0.15)" }}>
        <p style={{ fontSize:12, color:t.textMuted, marginBottom:6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ fontSize:13, color:p.color, fontWeight:600 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-glass pr-1">
      {/* SVG defs */}
      <svg width="0" height="0" style={{ position:"absolute", overflow:"hidden" }}>
        <defs>
          <linearGradient id="relatorio-grad-atendidos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={isDark?0.5:0.2}/>
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="relatorio-grad-aguardando" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ec4899" stopOpacity={isDark?0.4:0.18}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="relatorio-bar-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>

      <div className="p-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:t.textPrimary }}>Relatórios & Análises</h2>
            <p style={{ fontSize:13, color:t.textSecondary }}>Visão geral dos últimos 7 dias</p>
          </div>
          <button onClick={load} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background:isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)", border:`1px solid ${t.borderStrong}`, color:t.textSecondary }}>
            {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <RefreshCw size={15}/>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
            style={{ background:isDark?"rgba(239,68,68,0.1)":"#fef2f2", border:"1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} style={{ color:"#ef4444", flexShrink:0 }}/><span style={{ fontSize:12, color:"#ef4444" }}>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} style={{ color:"#7c3aed", animation:"spin 1s linear infinite" }}/>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {statCards.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                  className="px-4 py-4 rounded-2xl" style={t.panel}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background:`${stat.color}18`, border:`1px solid ${stat.color}35` }}>
                      <stat.icon size={16} style={{ color:stat.color }}/>
                    </div>
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ fontSize:11, fontWeight:600,
                        color:stat.change.startsWith("+")?(!stat.change.includes("-")?"#16a34a":"#dc2626"):"#dc2626",
                        background:stat.change.startsWith("+")?(isDark?"rgba(134,239,172,0.15)":"rgba(22,163,74,0.08)"):(isDark?"rgba(252,165,165,0.15)":"rgba(220,38,38,0.08)"),
                        border:`1px solid ${stat.change.startsWith("+")?(isDark?"rgba(134,239,172,0.2)":"rgba(22,163,74,0.12)"):(isDark?"rgba(252,165,165,0.2)":"rgba(220,38,38,0.12)")}` }}>
                      {stat.change}
                    </span>
                  </div>
                  <div style={{ fontSize:24, fontWeight:800, lineHeight:1, color:t.textPrimary }}>{stat.value}</div>
                  <div style={{ fontSize:12, color:t.textSecondary, marginTop:4 }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-3">
              {/* Area */}
              <div className="col-span-2 p-5 rounded-2xl" style={t.panel}>
                <div className="mb-4">
                  <div style={{ fontSize:14, fontWeight:600, color:t.textPrimary }}>Tickets por Dia</div>
                  <div style={{ fontSize:12, color:t.textSecondary }}>Resolvidos vs Aguardando</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                    <XAxis dataKey="day" tick={{ fill:tickColor, fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:tickColor, fontSize:11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="atendidos" name="Resolvidos"  stroke="#7c3aed" strokeWidth={2} fill="url(#relatorio-grad-atendidos)"/>
                    <Area type="monotone" dataKey="aguardando" name="Aguardando" stroke="#ec4899" strokeWidth={2} fill="url(#relatorio-grad-aguardando)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div className="p-5 rounded-2xl" style={t.panel}>
                <div className="mb-4">
                  <div style={{ fontSize:14, fontWeight:600, color:t.textPrimary }}>Status dos Tickets</div>
                  <div style={{ fontSize:12, color:t.textSecondary }}>Distribuição geral</div>
                </div>
                <div className="flex justify-center">
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx={80} cy={80} innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} opacity={isDark?0.85:0.8}/>
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background:item.color }}/>
                        <span style={{ fontSize:12, color:t.textSecondary }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize:12, color:t.textPrimary, fontWeight:600 }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar */}
              <div className="col-span-3 p-5 rounded-2xl" style={t.panel}>
                <div className="mb-4">
                  <div style={{ fontSize:14, fontWeight:600, color:t.textPrimary }}>Tickets por Fila</div>
                  <div style={{ fontSize:12, color:t.textSecondary }}>Volume por departamento</div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={mockBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false}/>
                    <XAxis type="number" tick={{ fill:tickColor, fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" tick={{ fill:isDark?"rgba(255,255,255,0.5)":"#9ca3af", fontSize:12 }} axisLine={false} tickLine={false} width={80}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="tickets" name="Tickets" fill="url(#relatorio-bar-grad)" radius={[0,6,6,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
