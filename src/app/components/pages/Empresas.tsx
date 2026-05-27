import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, AlertCircle, Loader2, CreditCard, RefreshCw, Building, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listCompanies, createCompany, updateCompany, Company } from "../../services/companiesService";
import { listPlans, createPlan, updatePlan, deletePlan, Plan } from "../../services/plansService";
import { useTheme } from "../../context/ThemeContext";
import { PlanFeatures } from "../../hooks/usePlanFeatures";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const parseMoney = (text: string) => {
  if (!text) return 0;
  const digits = text.replace(/\D/g, "");
  const amount = parseInt(digits, 10) || 0;
  return amount / 100;
};

export function Empresas() {
  const { user } = useAuth();
  const { t, mode } = useTheme();
  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState<"empresas" | "planos">("empresas");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Empresa form
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "", cnpj: "", adminEmail: "", adminPassword: "", adminName: "", adminCpf: "", adminPhone: "",
    planId: "", recurrence: "mensal", dueDay: "1",
  });

  // Plano form
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "", description: "", price: 0,
    maxUsers: "3", maxWhatsAppSessions: "1", maxTeams: "1", maxFlows: "0",
    campaigns: false, reports: false, integrations: false,
  });
  const [priceInput, setPriceInput] = useState(formatMoney(0));

  useEffect(() => {
    if (user?.role !== "super_admin") return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [c, p] = await Promise.all([listCompanies(), listPlans()]);
      setCompanies(Array.isArray(c) ? c : []);
      setPlans(Array.isArray(p) ? p : []);
    } catch {
      setError("Erro ao carregar dados.");
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const payload = { ...companyForm, dueDay: parseInt(companyForm.dueDay,10)||1 };
      const result = await createCompany(payload as any);
      setSuccess(result.message || "Empresa criada!");
      setShowCreateCompany(false);
      loadData();
    } catch { setError("Erro ao criar empresa."); }
    finally { setLoading(false); }
  };

  const toggleCompanyStatus = async (id: string, currentStatus: string) => {
    try {
      await updateCompany(id, { status: currentStatus==="active"?"blocked":"active" });
      loadData();
    } catch { setError("Erro ao alterar status."); }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      const features: PlanFeatures = {
        maxUsers: parseInt(planForm.maxUsers,10)||0,
        maxWhatsAppSessions: parseInt(planForm.maxWhatsAppSessions,10)||0,
        maxTeams: parseInt(planForm.maxTeams,10)||0,
        maxFlows: parseInt(planForm.maxFlows,10)||0,
        campaigns: planForm.campaigns, reports: planForm.reports, integrations: planForm.integrations,
      };
      const data = { name: planForm.name, description: planForm.description, price: planForm.price, features };
      if (editingPlanId) {
        await updatePlan(editingPlanId, data);
        setSuccess("Plano atualizado!");
      } else {
        await createPlan(data);
        setSuccess("Plano criado!");
      }
      resetPlanForm();
      loadData();
    } catch { setError("Erro ao salvar plano."); }
  };

  const resetPlanForm = () => {
    setPlanForm({ name:"", description:"", price:0, maxUsers:"3", maxWhatsAppSessions:"1", maxTeams:"1", maxFlows:"0", campaigns:false, reports:false, integrations:false });
    setPriceInput(formatMoney(0));
    setShowCreatePlan(false);
    setEditingPlanId(null);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name, description: plan.description, price: plan.price,
      maxUsers: String(plan.features.maxUsers), maxWhatsAppSessions: String(plan.features.maxWhatsAppSessions),
      maxTeams: String(plan.features.maxTeams), maxFlows: String(plan.features.maxFlows),
      campaigns: plan.features.campaigns, reports: plan.features.reports, integrations: plan.features.integrations,
    });
    setPriceInput(formatMoney(plan.price));
    setShowCreatePlan(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm("Remover plano?")) {
      await deletePlan(id);
      loadData();
    }
  };

  const btnPrimary = {
    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
    border: "none", color: "white", fontSize: 13, fontWeight: 600,
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
    padding: "8px 18px", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col gap-5" style={{ padding: 24 }}>
      <style>{`input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type="number"]{-moz-appearance:textfield;appearance:textfield}`}</style>

      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Painel SaaS</h3>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Gerencie empresas e planos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveTab("empresas"); setShowCreateCompany(true); }} style={btnPrimary}><Building size={16} /> Nova Empresa</button>
          <button onClick={() => { setActiveTab("planos"); setShowCreatePlan(true); }}
            style={{ ...btnPrimary, background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
            <CreditCard size={16} /> Novo Plano
          </button>
        </div>
      </div>

      <div className="flex gap-0">
        {(["empresas","planos"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-t-xl font-semibold text-sm"
            style={{
              background: activeTab===tab ? (isDark ? "rgba(255,255,255,0.07)" : "#fff") : "transparent",
              border: `1px solid ${activeTab===tab ? t.borderStrong : "transparent"}`,
              borderBottom: activeTab===tab ? "none" : `1px solid ${t.borderStrong}`,
              color: t.textPrimary,
            }}>
            {tab==="empresas"?"Empresas":"Planos"}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(239,68,68,0.1)":"#fef2f2",border:"1px solid rgba(239,68,68,0.2)"}}><AlertCircle size={14} color="#ef4444"/><span style={{fontSize:12,color:"#ef4444"}}>{error}</span></motion.div>}
        {success && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(16,185,129,0.1)":"#ecfdf5",border:"1px solid rgba(16,185,129,0.2)"}}><Check size={14} color="#10b981"/><span style={{fontSize:12,color:"#10b981"}}>{success}</span></motion.div>}
      </AnimatePresence>

      {activeTab==="empresas" && (
        <>
          {showCreateCompany && (
            <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="p-5 rounded-2xl flex flex-col gap-4" style={t.panelSubtle}>
              <h4 style={{color:t.textPrimary}}>Nova Empresa</h4>
              <form onSubmit={handleCreateCompany} className="grid grid-cols-2 gap-4">
                <input required placeholder="Nome da Empresa" value={companyForm.companyName} onChange={e=>setCompanyForm({...companyForm,companyName:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required placeholder="CNPJ" value={companyForm.cnpj} onChange={e=>setCompanyForm({...companyForm,cnpj:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required type="email" placeholder="Email do Admin" value={companyForm.adminEmail} onChange={e=>setCompanyForm({...companyForm,adminEmail:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required type="password" placeholder="Senha Temporária" value={companyForm.adminPassword} onChange={e=>setCompanyForm({...companyForm,adminPassword:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required placeholder="Nome do Admin" value={companyForm.adminName} onChange={e=>setCompanyForm({...companyForm,adminName:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required placeholder="CPF do Admin" value={companyForm.adminCpf} onChange={e=>setCompanyForm({...companyForm,adminCpf:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <input required placeholder="Telefone do Admin" value={companyForm.adminPhone} onChange={e=>setCompanyForm({...companyForm,adminPhone:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <select value={companyForm.planId} onChange={e=>setCompanyForm({...companyForm,planId:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}>
                  <option value="">Selecione um plano</option>
                  {plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={companyForm.recurrence} onChange={e=>setCompanyForm({...companyForm,recurrence:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}>
                  <option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="semestral">Semestral</option><option value="anual">Anual</option>
                </select>
                <input type="number" min="1" max="31" placeholder="Dia Vencimento" value={companyForm.dueDay} onChange={e=>setCompanyForm({...companyForm,dueDay:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                <div className="col-span-2 flex gap-2">
                  <button type="submit" disabled={loading} style={btnPrimary}>{loading?<Loader2 size={16} className="animate-spin"/>:<Check size={14}/>} Criar</button>
                  <button type="button" onClick={()=>setShowCreateCompany(false)} className="px-5 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.06)":"#f3f4f6",border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb",color:t.textSecondary}}>Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="rounded-2xl overflow-hidden" style={{border: `1px solid ${t.borderStrong}`, background: isDark?"rgba(255,255,255,0.03)":"#fff"}}>
            <table className="w-full text-sm">
              <thead><tr style={{borderBottom:`1px solid ${t.borderStrong}`}}><th className="p-3 text-left" style={{color:t.textMuted}}>Empresa</th><th className="p-3 text-left" style={{color:t.textMuted}}>Admin</th><th className="p-3 text-left" style={{color:t.textMuted}}>Plano</th><th className="p-3 text-left" style={{color:t.textMuted}}>Status</th><th className="p-3 text-center" style={{color:t.textMuted}}>Ações</th></tr></thead>
              <tbody>
                {companies.map(c=>{
                  const planName = plans.find(p=>p.id===c.planId)?.name||"-";
                  return (<tr key={c.id} style={{borderBottom:`1px solid ${t.borderStrong}`}}>
                    <td className="p-3" style={{color:t.textPrimary}}>{c.name}</td>
                    <td className="p-3" style={{color:t.textSecondary}}>{c.adminName||c.adminEmail||"-"}</td>
                    <td className="p-3" style={{color:t.textSecondary}}>{planName}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{background:c.status==="active"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",color:c.status==="active"?"#10b981":"#ef4444"}}>{c.status}</span></td>
                    <td className="p-3 text-center"><button onClick={()=>toggleCompanyStatus(c.id,c.status)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:c.status==="active"?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)",color:c.status==="active"?"#ef4444":"#10b981"}}>{c.status==="active"?"Bloquear":"Ativar"}</button></td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab==="planos" && (
        <>
          <div className="flex justify-between items-center">
            <h4 style={{color:t.textPrimary}}>Planos cadastrados</h4>
            <button onClick={loadData} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)",border:`1px solid ${t.borderStrong}`,color:t.textSecondary}}><RefreshCw size={15}/></button>
          </div>
          {showCreatePlan && (
            <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="p-5 rounded-2xl flex flex-col gap-4" style={t.panelSubtle}>
              <h4 style={{color:t.textPrimary}}>{editingPlanId?"Editar Plano":"Novo Plano"}</h4>
              <form onSubmit={handleCreatePlan} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Nome" value={planForm.name} onChange={e=>setPlanForm({...planForm,name:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                  <input placeholder="Preço" value={priceInput} onChange={e=>{setPriceInput(e.target.value);setPlanForm({...planForm,price:parseMoney(e.target.value)});}} onBlur={()=>setPriceInput(formatMoney(planForm.price))} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[["Máx. Usuários","maxUsers"],["Máx. Conexões","maxWhatsAppSessions"],["Máx. Equipes","maxTeams"],["Máx. Fluxos","maxFlows"]].map(([label,field])=>(
                    <div key={field}><label className="text-xs" style={{color:t.textMuted}}>{label}</label><input type="number" min="0" value={planForm[field as keyof typeof planForm]} onChange={e=>setPlanForm({...planForm,[field]:e.target.value})} className="w-full px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/></div>
                  ))}
                </div>
                <div className="flex gap-6">
                  {[["campaigns","Campanhas"],["reports","Relatórios"],["integrations","Integrações"]].map(([field,label])=>(
                    <label key={field} className="flex items-center gap-2 text-sm" style={{color:t.textSecondary}}>
                      <input type="checkbox" checked={planForm[field as keyof typeof planForm] as boolean} onChange={e=>setPlanForm({...planForm,[field]:e.target.checked})}/>
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" style={btnPrimary}>{editingPlanId?"Atualizar":"Criar"}</button>
                  <button type="button" onClick={resetPlanForm} className="px-5 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.06)":"#f3f4f6",border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb",color:t.textSecondary}}>Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}
          <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${t.borderStrong}`,background:isDark?"rgba(255,255,255,0.03)":"#fff"}}>
            <table className="w-full text-sm">
              <thead><tr style={{borderBottom:`1px solid ${t.borderStrong}`}}><th className="p-3 text-left" style={{color:t.textMuted}}>Nome</th><th className="p-3 text-left" style={{color:t.textMuted}}>Preço</th><th className="p-3 text-left" style={{color:t.textMuted}}>Limites</th><th className="p-3 text-left" style={{color:t.textMuted}}>Módulos</th><th className="p-3 text-center" style={{color:t.textMuted}}>Ações</th></tr></thead>
              <tbody>
                {plans.map(p=>(
                  <tr key={p.id} style={{borderBottom:`1px solid ${t.borderStrong}`}}>
                    <td className="p-3" style={{color:t.textPrimary}}>{p.name}</td>
                    <td className="p-3" style={{color:t.textPrimary}}>{formatMoney(p.price)}</td>
                    <td className="p-3" style={{color:t.textSecondary}}>{p.features.maxUsers} / {p.features.maxWhatsAppSessions} / {p.features.maxTeams} / {p.features.maxFlows}</td>
                    <td className="p-3" style={{color:t.textSecondary}}>{[p.features.campaigns?"Campanhas":"",p.features.reports?"Relatórios":"",p.features.integrations?"Integrações":""].filter(Boolean).join(", ")||"Nenhum"}</td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button onClick={()=>handleEditPlan(p)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:"#7c3aed",color:"white"}}>Editar</button>
                      <button onClick={()=>handleDeletePlan(p.id)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{background:"#ef4444",color:"white"}}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
