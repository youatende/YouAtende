import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, UserPlus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { listTeams, createTeam, updateTeam, deleteTeam, getTeamMembers, addTeamMember, removeTeamMember, Team, TeamMember } from "../../services/teamsService";
import { usePlanFeatures } from "../../hooks/usePlanFeatures";

export function TeamManagement() {
  const { user } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const { features } = usePlanFeatures();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await listTeams();
      setTeams(data);
      const memMap: Record<string, TeamMember[]> = {};
      for (const team of data) {
        memMap[team.id] = await getTeamMembers(team.id);
      }
      setMembers(memMap);
    } catch {
      setError("Erro ao carregar equipas.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createTeam(newName);
      setNewName("");
      setShowCreate(false);
      loadTeams();
    } catch {
      setError("Erro ao criar equipa.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover equipa?")) {
      await deleteTeam(id);
      loadTeams();
    }
  };

  const handleAddMember = async (teamId: string) => {
    const userId = prompt("ID do utilizador (UUID)?");
    if (!userId) return;
    try {
      await addTeamMember(teamId, userId);
      const updated = await getTeamMembers(teamId);
      setMembers({...members, [teamId]: updated});
    } catch {
      setError("Erro ao adicionar membro.");
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    if (confirm("Remover membro?")) {
      await removeTeamMember(teamId, userId);
      const updated = await getTeamMembers(teamId);
      setMembers({...members, [teamId]: updated});
    }
  };

  const cardBg = isDark ? "rgba(255,255,255,0.07)" : "#ffffff";
  const border = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.55)" : "#6b7280";
  const inputBg = isDark ? "rgba(0,0,0,0.22)" : "#f3f4f6";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb";
  const inputColor = isDark ? "#ffffff" : "#111827";

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}>Equipas</h2>
        <button onClick={() => setShowCreate(true)} disabled={features ? teams.length >= features.maxTeams : false}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", cursor: "pointer", opacity: (features && teams.length >= features.maxTeams) ? 0.5 : 1 }}>
          <Plus size={16} /> Nova Equipa
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: cardBg, border, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da equipa"
            style={{ width: "100%", padding: 8, borderRadius: 8, background: inputBg, border: inputBorder, color: inputColor, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCreate} style={{ padding: "6px 14px", borderRadius: 6, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>Criar</button>
            <button onClick={() => setShowCreate(false)} style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", border: border, color: textPrimary, cursor: "pointer" }}>Cancelar</button>
          </div>
        </motion.div>
      )}

      {teams.map(team => (
        <div key={team.id} style={{ background: cardBg, border, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: textPrimary }}>{team.name}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleAddMember(team.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "#fff", cursor: "pointer" }}><UserPlus size={14} /></button>
              <button onClick={() => handleDelete(team.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
          </div>
          {members[team.id] && members[team.id].length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: textSecondary }}>Membros:</div>
              {members[team.id].map(m => (
                <div key={m.userId} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: 13, color: textPrimary }}>{m.name || m.email || m.userId}</span>
                  <button onClick={() => handleRemoveMember(team.id, m.userId)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && <div style={{ padding: 8, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginTop: 12 }}>{error}</div>}
    </div>
  );
}
