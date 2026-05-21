import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Shield, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listCompanies, createCompany, updateCompany, Company } from "../../services/companiesService";
import { useTheme } from "../../context/ThemeContext";

export function Empresas() {
  const { user } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ companyName: "", adminEmail: "", adminPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== "super_admin") return;
    loadCompanies();
  }, [user]);

  const loadCompanies = async () => {
    try {
      const data = await listCompanies();
      setCompanies(data);
    } catch {
      setError("Erro ao carregar empresas.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await createCompany(form);
      setSuccess("Empresa criada com sucesso!");
      setForm({ companyName: "", adminEmail: "", adminPassword: "" });
      setShowCreate(false);
      loadCompanies();
    } catch {
      setError("Erro ao criar empresa.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      await updateCompany(id, { status: newStatus });
      loadCompanies();
    } catch {
      setError("Erro ao alterar status.");
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        Acesso restrito a Super Administradores.
      </div>
    );
  }

  /* Styles */
  const cardBg = isDark ? "rgba(255,255,255,0.07)" : "#ffffff";
  const border = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";
  const inputBg = isDark ? "rgba(0,0,0,0.22)" : "#f3f4f6";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const inputColor = isDark ? "#ffffff" : "#111827";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>Gestão de Empresas</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginBottom: 16 }}>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e", marginBottom: 16 }}>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          style={{ background: cardBg, border, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }}>Criar nova empresa</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Nome da Empresa</label>
              <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Email do Administrador</label>
              <input type="email" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} required
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Senha do Administrador</label>
              <input type="password" value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} required
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor, fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: 10, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Criar Empresa"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                style={{ padding: "10px 16px", borderRadius: 8, border, background: "transparent", color: textPrimary, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: textSecondary }}>Carregando...</div>
      ) : (
        <div style={{ borderRadius: 16, background: cardBg, border, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: border }}>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Empresa</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Admin</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Criada em</th>
                <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} style={{ borderBottom: border }}>
                  <td style={{ padding: 12, fontSize: 13, color: textPrimary, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: 12, fontSize: 13, color: textSecondary }}>{c.adminEmail || "—"}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: c.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: c.status === "active" ? "#22c55e" : "#ef4444",
                    }}>
                      {c.status === "active" ? <Check size={12} /> : <X size={12} />}
                      {c.status === "active" ? "Ativa" : "Bloqueada"}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: textSecondary }}>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => toggleStatus(c.id, c.status)}
                      style={{
                        padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 500, fontSize: 12,
                        background: c.status === "active" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                        color: c.status === "active" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {c.status === "active" ? "Bloquear" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
