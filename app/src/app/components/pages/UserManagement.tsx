import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Shield, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listUsers, createUser, User } from "../../services/usersService";
import { useTheme } from "../../context/ThemeContext";

export function UserManagement() {
  const { user } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("agent");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setError("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await createUser({
        email: newEmail,
        password: newPassword,
        name: newEmail.split('@')[0], // nome simplificado
        role: newRole,
      });
      setSuccess("Usuário criado com sucesso!");
      setNewEmail("");
      setNewPassword("");
      setShowCreate(false);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar usuário.");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        Acesso restrito a administradores.
      </div>
    );
  }

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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>Gestão de Usuários</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e", marginBottom: 16 }}>
          {success}
        </div>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          style={{ background: cardBg, border, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 16 }}>Criar novo usuário</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Email</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder }}>
                <Mail size={14} style={{ color: "rgba(124,58,237,0.6)" }} />
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="colaborador@email.com" required
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: inputColor }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Senha</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder }}>
                <Lock size={14} style={{ color: "rgba(124,58,237,0.6)" }} />
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: inputColor }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: textSecondary, marginBottom: 4, display: "block" }}>Função</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor, fontSize: 13 }}>
                <option value="agent">Agente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit"
              style={{ padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              Criar Usuário
            </button>
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
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Email</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Função</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: textSecondary, fontWeight: 500 }}>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: border }}>
                  <td style={{ padding: 12, fontSize: 13, color: textPrimary }}>{u.email}</td>
                  <td style={{ padding: 12, fontSize: 13, color: textPrimary }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Shield size={14} style={{ color: u.role === "admin" ? "#f59e0b" : "#10b981" }} />
                      {u.role === "admin" ? "Admin" : "Agente"}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: textSecondary }}>
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
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
