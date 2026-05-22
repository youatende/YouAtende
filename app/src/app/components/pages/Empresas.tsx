import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, AlertCircle, Loader2, CreditCard, RefreshCw } from "lucide-react";
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
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState<"empresas" | "planos">("empresas");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "", cnpj: "", adminEmail: "", adminPassword: "", adminName: "", adminCpf: "", adminPhone: "",
    planId: "", recurrence: "mensal", dueDay: "1",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: 0,
    maxUsers: "3",
    maxWhatsAppSessions: "1",
    maxTeams: "1",
    maxFlows: "0",
    campaigns: false,
    reports: false,
    integrations: false,
  });
  const [priceInput, setPriceInput] = useState(formatMoney(0));

  useEffect(() => {
    if (user?.role !== "super_admin") return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [c, p] = await Promise.all([listCompanies(), listPlans()]);
      setCompanies(Array.isArray(c) ? c : (c as any)?.companies || []);
      const safePlans = Array.isArray(p) ? p : (p as any)?.plans || [];
      setPlans(safePlans.map((plan: any) => ({
        ...plan,
        features: (plan.features && typeof plan.features === 'object') ? plan.features : {
          maxUsers: 0, maxWhatsAppSessions: 0, maxTeams: 0, maxFlows: 0,
          campaigns: false, reports: false, integrations: false,
        }
      })));
    } catch (err) {
      console.error("Erro ao carregar dados", err);
      setError("Erro ao carregar dados.");
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = { ...companyForm, dueDay: parseInt(companyForm.dueDay, 10) || 1 };
      const result = await createCompany(payload as any);
      setSuccess(result.message || "Empresa criada com sucesso!");
      setCompanyForm({
        companyName: "", cnpj: "", adminEmail: "", adminPassword: "", adminName: "", adminCpf: "", adminPhone: "",
        planId: "", recurrence: "mensal", dueDay: "1",
      });
      setShowCreateCompany(false);
      loadData();
    } catch {
      setError("Erro ao criar empresa.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyStatus = async (id: string, currentStatus: string) => {
    try {
      await updateCompany(id, { status: currentStatus === "active" ? "blocked" : "active" });
      loadData();
    } catch {
      setError("Erro ao alterar status.");
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const features: PlanFeatures = {
        maxUsers: parseInt(planForm.maxUsers, 10) || 0,
        maxWhatsAppSessions: parseInt(planForm.maxWhatsAppSessions, 10) || 0,
        maxTeams: parseInt(planForm.maxTeams, 10) || 0,
        maxFlows: parseInt(planForm.maxFlows, 10) || 0,
        campaigns: planForm.campaigns,
        reports: planForm.reports,
        integrations: planForm.integrations,
      };
      const planData = { name: planForm.name, description: planForm.description, price: planForm.price, features };
      if (editingPlanId) {
        await updatePlan(editingPlanId, planData);
        setSuccess("Plano atualizado!");
      } else {
        await createPlan(planData);
        setSuccess("Plano criado!");
      }
      resetPlanForm();
      loadData();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar plano.");
    }
  };

  const resetPlanForm = () => {
    setPlanForm({ name: "", description: "", price: 0, maxUsers: "3", maxWhatsAppSessions: "1", maxTeams: "1", maxFlows: "0", campaigns: false, reports: false, integrations: false });
    setPriceInput(formatMoney(0));
    setShowCreatePlan(false);
    setEditingPlanId(null);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name, description: plan.description, price: plan.price,
      maxUsers: String(plan.features.maxUsers),
      maxWhatsAppSessions: String(plan.features.maxWhatsAppSessions),
      maxTeams: String(plan.features.maxTeams),
      maxFlows: String(plan.features.maxFlows),
      campaigns: plan.features.campaigns, reports: plan.features.reports, integrations: plan.features.integrations,
    });
    setPriceInput(formatMoney(plan.price));
    setShowCreatePlan(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm("Tem certeza?")) {
      try {
        await deletePlan(id);
        setSuccess("Plano removido.");
        loadData();
      } catch {
        setError("Erro ao remover plano.");
      }
    }
  };

  const cardBg = isDark ? "rgba(255,255,255,0.07)" : "#ffffff";
  const border = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";
  const inputBg = isDark ? "rgba(0,0,0,0.22)" : "#f3f4f6";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const inputColor = isDark ? "#ffffff" : "#111827";
  const labelColor = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";

  return (
    <div style={{ padding: 24 }}>
      <style>{`input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type="number"]{-moz-appearance:textfield;appearance:textfield}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>Gestão de Clientes</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setActiveTab("empresas"); setShowCreateCompany(true); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", cursor: "pointer" }}><Plus size={16} /> Nova Empresa</button>
          <button onClick={() => { setActiveTab("planos"); setShowCreatePlan(true); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #ec4899, #7c3aed)", color: "#fff", cursor: "pointer" }}><CreditCard size={16} /> Novo Plano</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        {(["empresas", "planos"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: "8px 8px 0 0", border: border, background: activeTab === tab ? cardBg : "transparent", color: textPrimary, fontWeight: 600, cursor: "pointer", borderBottom: activeTab === tab ? "none" : border }}>
            {tab === "empresas" ? "Empresas" : "Planos"}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginBottom: 16 }}>{error}</motion.div>}
        {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e", marginBottom: 16 }}>{success}</motion.div>}
      </AnimatePresence>

      {activeTab === "empresas" && (
        <>
          {showCreateCompany && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: cardBg, border, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <h3 style={{ color: textPrimary, marginBottom: 12 }}>Nova Empresa</h3>
              <form onSubmit={handleCreateCompany} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 12, color: labelColor }}>Nome da Empresa</label><input required value={companyForm.companyName} onChange={e => setCompanyForm({...companyForm, companyName: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>CNPJ</label><input required value={companyForm.cnpj} onChange={e => setCompanyForm({...companyForm, cnpj: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Email do Admin</label><input type="email" required value={companyForm.adminEmail} onChange={e => setCompanyForm({...companyForm, adminEmail: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Senha Temporária</label><input type="password" required value={companyForm.adminPassword} onChange={e => setCompanyForm({...companyForm, adminPassword: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Nome do Admin</label><input required value={companyForm.adminName} onChange={e => setCompanyForm({...companyForm, adminName: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>CPF do Admin</label><input required value={companyForm.adminCpf} onChange={e => setCompanyForm({...companyForm, adminCpf: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Telefone do Admin</label><input required value={companyForm.adminPhone} onChange={e => setCompanyForm({...companyForm, adminPhone: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Plano</label><select required value={companyForm.planId} onChange={e => setCompanyForm({...companyForm, planId: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }}><option value="">Selecione um plano</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Recorrência</label><select value={companyForm.recurrence} onChange={e => setCompanyForm({...companyForm, recurrence: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }}><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="semestral">Semestral</option><option value="anual">Anual</option></select></div>
                <div><label style={{ fontSize: 12, color: labelColor }}>Dia de Vencimento (1-31)</label><input type="number" min="1" max="31" value={companyForm.dueDay} onChange={e => setCompanyForm({...companyForm, dueDay: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                <div style={{ gridColumn: "span 2", display: "flex", gap: 8 }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "#fff", cursor: "pointer" }}>{loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Criar Empresa"}</button>
                  <button type="button" onClick={() => setShowCreateCompany(false)} style={{ padding: 10, borderRadius: 8, border, background: "transparent", color: textPrimary }}>Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}
          <div style={{ borderRadius: 16, background: cardBg, border, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: border }}><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Empresa</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>CNPJ</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Admin</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Telefone</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Plano</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Recorrência</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Vencimento</th><th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary }}>Status</th><th style={{ textAlign: "center", padding: 12, fontSize: 12, color: textSecondary }}>Ações</th></tr></thead>
              <tbody>
                {companies.map(c => {
                  const planName = plans.find(p => p.id === c.planId)?.name || "-";
                  return (
                    <tr key={c.id} style={{ borderBottom: border }}>
                      <td style={{ padding: 12, color: textPrimary }}>{c.name}</td>
                      <td style={{ padding: 12, color: textSecondary }}>{c.cnpj || "-"}</td>
                      <td style={{ padding: 12, color: textSecondary }}>{c.adminName || c.adminEmail || "-"}</td>
                      <td style={{ padding: 12, color: textSecondary }}>{c.adminPhone || "-"}</td>
                      <td style={{ padding: 12, color: textSecondary }}>{planName}</td>
                      <td style={{ padding: 12, color: textSecondary }}>{c.recurrence || "-"}</td>
                      <td style={{ padding: 12, color: textSecondary }}>Dia {c.dueDay || "-"}</td>
                      <td style={{ padding: 12 }}><span style={{ background: c.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: c.status === "active" ? "#22c55e" : "#ef4444", padding: "2px 8px", borderRadius: 12 }}>{c.status}</span></td>
                      <td style={{ padding: 12, textAlign: "center" }}><button onClick={() => toggleCompanyStatus(c.id, c.status)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: c.status === "active" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: c.status === "active" ? "#ef4444" : "#22c55e" }}>{c.status === "active" ? "Bloquear" : "Ativar"}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "planos" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Planos cadastrados</h3>
            <button onClick={loadData} title="Atualizar lista" style={{ background: "transparent", border, borderRadius: 8, padding: "4px 12px", cursor: "pointer", color: textSecondary }}><RefreshCw size={16} /></button>
          </div>
          {showCreatePlan && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: cardBg, border, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <h3 style={{ color: textPrimary, marginBottom: 12 }}>{editingPlanId ? "Editar Plano" : "Novo Plano"}</h3>
              <form onSubmit={handleCreatePlan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 12, color: labelColor }}>Nome</label><input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                  <div><label style={{ fontSize: 12, color: labelColor }}>Preço</label><input value={priceInput} onChange={e => { const raw = e.target.value; setPriceInput(raw); setPlanForm({...planForm, price: parseMoney(raw)}); }} onBlur={() => setPriceInput(formatMoney(planForm.price))} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 12, color: labelColor }}>Descrição</label><input value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                </div>
                <h4 style={{ color: textSecondary, margin: 0 }}>Limites de Recursos</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {([
                    ["Máx. Usuários", "maxUsers"],
                    ["Máx. Conexões WhatsApp", "maxWhatsAppSessions"],
                    ["Máx. Equipes", "maxTeams"],
                    ["Máx. Fluxos de URA", "maxFlows"],
                  ] as const).map(([label, field]) => (
                    <div key={field}><label style={{ fontSize: 12, color: labelColor }}>{label}</label><input type="number" min="0" step="1" value={planForm[field]} onChange={e => setPlanForm({...planForm, [field]: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor }} /></div>
                  ))}
                </div>
                <h4 style={{ color: textSecondary, margin: 0 }}>Módulos</h4>
                <div style={{ display: "flex", gap: 24 }}>
                  {([
                    ["campaigns", "Campanhas"],
                    ["reports", "Relatórios"],
                    ["integrations", "Integrações"],
                  ] as const).map(([field, label]) => (
                    <div key={field} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: labelColor }}>{label}</span>
                      <button type="button" onClick={() => setPlanForm({...planForm, [field]: !planForm[field]})} style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: planForm[field] ? "#7c3aed" : (isDark ? "rgba(255,255,255,0.15)" : "#d1d5db"), position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: planForm[field] ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" style={{ flex: 1, padding: 10, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "#fff", cursor: "pointer" }}>{editingPlanId ? "Atualizar Plano" : "Criar Plano"}</button>
                  <button type="button" onClick={resetPlanForm} style={{ padding: 10, borderRadius: 8, border, background: "transparent", color: textPrimary }}>Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}
          <div style={{ borderRadius: 16, background: cardBg, border, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: border }}><th style={{ textAlign: "left", padding: 12, color: textSecondary }}>Nome</th><th style={{ textAlign: "left", padding: 12, color: textSecondary }}>Preço</th><th style={{ textAlign: "left", padding: 12, color: textSecondary }}>Limites (Usuários/Conexões/Equipes/Fluxos)</th><th style={{ textAlign: "left", padding: 12, color: textSecondary }}>Módulos</th><th style={{ textAlign: "center", padding: 12, color: textSecondary }}>Ações</th></tr></thead>
              <tbody>
                {plans.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: textSecondary }}>Nenhum plano encontrado.</td></tr>}
                {plans.map(p => (
                  <tr key={p.id} style={{ borderBottom: border }}>
                    <td style={{ padding: 12, color: textPrimary }}>{p.name}</td>
                    <td style={{ padding: 12, color: textPrimary }}>{formatMoney(p.price)}</td>
                    <td style={{ padding: 12, color: textSecondary }}>{p.features.maxUsers} / {p.features.maxWhatsAppSessions} / {p.features.maxTeams} / {p.features.maxFlows}</td>
                    <td style={{ padding: 12, color: textSecondary }}>{[p.features.campaigns ? "Campanhas" : "", p.features.reports ? "Relatórios" : "", p.features.integrations ? "Integrações" : ""].filter(Boolean).join(", ") || "Nenhum"}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button onClick={() => handleEditPlan(p)} style={{ marginRight: 8, padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: "#7c3aed", color: "#fff" }}>Editar</button>
                      <button onClick={() => handleDeletePlan(p.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: "#ef4444", color: "#fff" }}>Remover</button>
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
